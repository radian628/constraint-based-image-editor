import { Token, TokenPosition } from "typescript-parsec";
import { Primitive, Type } from "./type-system.js";

export abstract class ASTNode<T> {
  d: T;
  start: Token<any>;
  end: Token<any>;

  constructor(d: T, start: Token<any>, end: Token<any>) {
    this.d = d;
    this.start = start;
    this.end = end;
  }

  abstract stringify(bp: number): string;

  abstract children(): ASTNode<any>[];

  abstract type(ctx: TypecheckContext): Type;
}

export type ExecutionContext = {
  getValue(node: ExprNode): any;
};

export type TypecheckContext = {
  getType(node: ExprNode): Type;
};

export interface Expression {
  // value(ctx: ExecutionContext): any;
}

export type ExprNode =
  | FloatNode
  | IntNode
  | StringLiteralNode
  | BooleanNode
  | IdentifierNode
  | CallNode
  | StructNode
  | TupleNode
  | BinaryOperatorNode
  | ErrorNode;

export class FloatNode extends ASTNode<number> {
  stringify() {
    return this.d.toString();
  }

  children() {
    return [];
  }

  type(ctx) {
    return { type: "float" } as Primitive;
  }
}

export class IntNode extends ASTNode<BigInt> {
  stringify() {
    return this.d.toString();
  }

  children() {
    return [];
  }

  type(ctx) {
    return { type: "int" } as Primitive;
  }
}

export class StringLiteralNode extends ASTNode<string> {
  stringify() {
    return `"${this.d}"`;
  }

  children(): ASTNode<any>[] {
    return [];
  }

  type(ctx) {
    return { type: "string" } as Primitive;
  }
}

export class BooleanNode extends ASTNode<boolean> {
  stringify() {
    return this.d ? "true" : "false";
  }

  children() {
    return [];
  }

  type(ctx) {
    return { type: "bool" } as Primitive;
  }
}

export class IdentifierNode extends ASTNode<string> {
  stringify() {
    return this.d;
  }

  children() {
    return [];
  }

  type(ctx: TypecheckContext) {
    return ctx.getType(this);
  }
}

export const defaultBindingPower = 0;

export const functionCallBindingPower = 70;

export const maxBindingPower = 200;

const unaryOpBindingPower = {
  "-": 70,
  "!": 70,
};

const binaryOpBindingPower = {
  "||": 10,

  "&&": 20,

  ">": 30,
  "<": 30,
  ">=": 30,
  "<=": 30,
  "==": 30,
  "!=": 30,

  "+": 40,
  "-": 40,

  "%": 50,
  "*": 50,
  "/": 50,

  ".": 80,
} as const;

export type BinaryOperator =
  // math
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "^"
  // comparison
  | ">"
  | "<"
  | ">="
  | "<="
  | "=="
  | "!="
  // logic
  | "&&"
  | "||"
  // member access
  | ".";

export class BinaryOperatorNode extends ASTNode<{
  op: BinaryOperator;
  left: ExprNode;
  right: ExprNode;
}> {
  stringify(bp: number) {
    const bp2 = binaryOpBindingPower[this.d.op];

    // if this expr has a lower bp than its surrounding environment (e.g. an addition within a multiplication), then parenthesize
    const shouldParenthesize = bp2 < bp;

    const nextbp = shouldParenthesize ? defaultBindingPower : bp2;

    const isMemberAccess = this.d.op == ".";

    const lstr = this.d.left.stringify(nextbp);
    let rstr = this.d.right.stringify(nextbp);

    if (isMemberAccess && !(this.d.right instanceof IdentifierNode))
      rstr = `(${rstr})`;

    const baseExpr = isMemberAccess
      ? `${lstr}.${rstr}`
      : `${lstr} ${this.d.op} ${rstr}`;

    return shouldParenthesize ? `(${baseExpr})` : baseExpr;
  }

  children() {
    return [this.d.left, this.d.right];
  }

  type(ctx) {}
}

export type UnaryOperator = "-" | "!";

export class UnaryOpNode extends ASTNode<{
  op: UnaryOperator;
  operand: ExprNode;
}> {
  stringify(bp) {
    const bp2 = unaryOpBindingPower[this.d.op];

    // if this expr has a lower bp than its surrounding environment (e.g. an addition within a multiplication), then parenthesize
    const shouldParenthesize = bp2 < bp;

    const nextbp = shouldParenthesize ? defaultBindingPower : bp2;

    const baseExpr = `${this.d.op}${this.d.operand.stringify(nextbp)}`;

    return shouldParenthesize ? `(${baseExpr})` : baseExpr;
  }

  children(): ASTNode<any>[] {
    return [this.d.operand];
  }
}

export class CallNode extends ASTNode<{
  fn: ExprNode;
  args: ExprNode[];
  kwargs: [IdentifierNode, ExprNode][];
}> {
  stringify() {
    const spacing =
      this.d.args.length > 0 && this.d.kwargs.length > 0 ? ", " : "";
    return `${this.d.fn.stringify(functionCallBindingPower)}(${this.d.args
      .map((arg) => arg.stringify(defaultBindingPower))
      .join(", ")}${spacing}${this.d.kwargs
      .map(
        ([name, arg]) =>
          `${name.stringify()} = ${arg.stringify(defaultBindingPower)}`
      )
      .join(", ")})`;
  }

  children() {
    return [this.d.fn, ...this.d.args, ...this.d.kwargs.flat()];
  }
}

export class ProgramNode extends ASTNode<ExprNode[]> {
  stringify() {
    return this.d.map((n) => n.stringify(defaultBindingPower)).join("\n");
  }

  children() {
    return this.d;
  }
}

export class StructNode extends ASTNode<{
  fields: [IdentifierNode, ExprNode][];
}> {
  stringify(bp) {
    return `{${this.d.fields
      .map(([name, arg]) => {
        return `${name.stringify()} = ${arg.stringify(defaultBindingPower)}`;
      })
      .join(", ")}}`;
  }

  children() {
    return [...this.d.fields.map(([name, arg]) => arg)];
  }
}

export class TupleNode extends ASTNode<{
  fields: ExprNode[];
}> {
  stringify(bp): string {
    return `{${this.d.fields
      .map((arg) => arg.stringify(defaultBindingPower))
      .join(", ")}}`;
  }

  children() {
    return this.d.fields;
  }
}

export class FunctionNode extends ASTNode<{
  args: {
    name: IdentifierNode;
    type?: ExprNode;
    defaultValue?: ExprNode;
  }[];
  kwArgs: {
    name: IdentifierNode;
    type?: ExprNode;
    defaultValue?: ExprNode;
  }[];
  body: ExprNode;
}> {
  stringify(bp) {
    const parseArgArray = (args: typeof this.d.args, delim: string) =>
      args.map((arg) => {
        const argname = arg.name.stringify();
        const type = `${arg.name.stringify()}${delim}${arg.type.stringify(
          defaultBindingPower
        )}`;
        const defaultValue = arg.defaultValue
          ? ` = ${arg.defaultValue.stringify(defaultBindingPower)}`
          : "";
        return argname + type + defaultValue;
      });

    return `(${parseArgArray(this.d.args, ":")}${parseArgArray(
      this.d.kwArgs,
      " =>"
    )} -> ${this.d.body.stringify(defaultBindingPower)}`;
  }

  children() {
    return [...this.d.args, ...this.d.kwArgs]
      .map(
        ({ name, type, defaultValue }) =>
          [name, type, defaultValue] as ExprNode[]
      )
      .flat(1);
  }
}

export class BlockNode extends ASTNode<{
  constituents: StatementNode[];
  returns: ExprNode;
}> {
  stringify(bp) {
    return `{${this.d.constituents
      .map((c) => c.stringify(defaultBindingPower))
      .join("\n")}${this.d.returns.stringify(defaultBindingPower)}}`;
  }

  children() {
    return [...this.d.constituents, this.d.returns];
  }

  type(ctx) {
    return ctx.getType(this.d.returns);
  }
}

type StatementNode = VariableDefinitionNode | ScopeNode | ErrorNode;

export class VariableDefinitionNode extends ASTNode<{
  left: IdentifierNode;
  type?: ExprNode;
  right: ExprNode;
}> {
  stringify(bp) {
    return `${this.d.left.stringify()}${
      this.d.type ? `: ${this.d.type.stringify(defaultBindingPower)}` : ""
    } = ${this.d.right.stringify(defaultBindingPower)}`;
  }

  children() {
    return [this.d.left, this.d.right];
  }
}

export class ErrorNode extends ASTNode<{
  why: string;
}> {
  stringify(bp) {
    return `error("${this.d.why}")`;
  }

  children() {
    return [];
  }
}
