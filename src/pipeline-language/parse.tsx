import {
  Parser,
  Rule,
  Token,
  alt_sc,
  apply,
  buildLexer,
  expectEOF,
  expectSingleResult,
  kmid,
  lrec_sc,
  nil,
  rep,
  rep_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import {
  BinaryOperator,
  BinaryOperatorNode,
  BooleanNode,
  CallNode,
  ExprNode,
  FloatNode,
  IdentifierNode,
  IntNode,
  StringLiteralNode,
  StructNode,
  TupleNode,
} from "./ast.js";

export enum TokenKind {
  Space,
  Fn,
  Int,
  Float,
  String,
  Identifier,

  Add,
  Sub,
  Mul,
  Div,
  Mod,
  Exp,

  Equals,
  NotEquals,
  Greater,
  Lesser,
  GreaterEquals,
  LesserEquals,

  And,
  Or,
  Not,

  OpenParen,
  CloseParen,

  OpenSquare,
  CloseSquare,

  OpenCurly,
  CloseCurly,

  Assign,

  MemberAccess,

  Comma,
}

const floatRegex = /^[0-9]+\.[0-9]*|^[0-9]*\.[0-9]+/g;

export const lexer = buildLexer([
  [false, /^[ \r\t\n]/g, TokenKind.Space],
  [true, /^[0-9]+/g, TokenKind.Int],
  [true, floatRegex, TokenKind.Float],
  [true, /^"(\\"|[^"])*"/g, TokenKind.String],
  [true, /^[a-zA-Z_][0-9a-zA-Z_]*/g, TokenKind.Identifier],

  [true, /^\+/g, TokenKind.Add],
  [true, /^\-/g, TokenKind.Sub],
  [true, /^(\*|\\cdot ?)/g, TokenKind.Mul],
  [true, /^\//g, TokenKind.Div],
  [true, /^\%/g, TokenKind.Mod],
  [true, /^\^/g, TokenKind.Exp],

  [true, /^\=\=/g, TokenKind.Equals],
  [true, /^\!\=/g, TokenKind.NotEquals],
  [true, /^\>/g, TokenKind.Greater],
  [true, /^\</g, TokenKind.Lesser],
  [true, /^\>\=/g, TokenKind.GreaterEquals],
  [true, /^\<\=/g, TokenKind.LesserEquals],

  [true, /^\&\&/g, TokenKind.And],
  [true, /^\|\|/g, TokenKind.Or],
  [true, /^!/g, TokenKind.Not],

  [true, /^\(/g, TokenKind.OpenParen],
  [true, /^\)/g, TokenKind.CloseParen],

  [true, /^\[/g, TokenKind.OpenSquare],
  [true, /^\]/g, TokenKind.CloseSquare],

  [true, /^\{/g, TokenKind.OpenCurly],
  [true, /^\}/g, TokenKind.CloseCurly],

  [true, /^=/g, TokenKind.Assign],

  [true, /^\./g, TokenKind.MemberAccess],

  [true, /^\,/g, TokenKind.Comma],
]);

export const PRIMARY_EXPR = rule<TokenKind, ExprNode>();

export const EXPR = rule<TokenKind, ExprNode>();

function commaSeparatedList<T>(
  parser: Parser<TokenKind, T>
): Parser<TokenKind, T[]> {
  return alt_sc(
    lrec_sc(
      apply(parser, (t) => [t]),
      seq(str(","), parser),
      (left, [_, right]) => [...left, right]
    ),
    apply(nil(), () => [])
  );
}

function nonemptyCommaSeparatedList<T>(
  parser: Parser<TokenKind, T>
): Parser<TokenKind, T[]> {
  return lrec_sc(
    apply(parser, (t) => [t]),
    seq(str(","), parser),
    (left, [_, right]) => [...left, right]
  );
}

const STRUCT_EXPR: Parser<TokenKind, StructNode> = kmid(
  str("{"),
  apply(
    commaSeparatedList(
      apply(
        seq(tok(TokenKind.Identifier), str("="), EXPR),
        ([ident, _, expr]) =>
          [new IdentifierNode(ident.text, ident, ident), expr] as [
            IdentifierNode,
            ExprNode
          ]
      )
    ),
    (fields, range) => {
      return new StructNode({ fields }, ...range);
    }
  ),
  str("}")
);

const TUPLE_EXPR: Parser<TokenKind, TupleNode> = kmid(
  str("{"),
  apply(
    commaSeparatedList(EXPR),
    (fields, range) => new TupleNode({ fields }, ...range)
  ),
  str("}")
);

PRIMARY_EXPR.setPattern(
  alt_sc(
    // float
    apply(
      tok(TokenKind.Float),
      (num, range) => new FloatNode(Number(num.text), ...range)
    ),

    // int
    apply(
      tok(TokenKind.Int),
      (num, range) => new IntNode(BigInt(num.text), ...range)
    ),

    // parenthesized
    kmid(str("("), EXPR, str(")")),

    // string literal
    apply(
      tok(TokenKind.String),
      (str, range) =>
        new StringLiteralNode(
          str.text.slice(1, -1).replace(/\\"/g, '"'),
          ...range
        )
    ),

    // boolean
    apply(
      alt_sc(str("true"), str("false")),
      (str, range) => new BooleanNode(str.text === "true", ...range)
    ),

    // identifier
    apply(
      tok(TokenKind.Identifier),
      (str, range) => new IdentifierNode(str.text, ...range)
    ),

    STRUCT_EXPR,

    TUPLE_EXPR
  )
);

function makeBinOpRule(
  ops: Parser<TokenKind, BinaryOperator>,
  next: Parser<TokenKind, ExprNode>,
  ruleToUse?: Rule<TokenKind, ExprNode>
) {
  const BINOP = ruleToUse ?? rule<TokenKind, ExprNode>();

  BINOP.setPattern(
    lrec_sc(
      next,
      seq(ops, next),
      (left, [op, right]) =>
        new BinaryOperatorNode(
          {
            op,
            left,
            right,
          },
          left.start,
          right.end
        )
    )
  );

  return BINOP;
}

const BINOP_MEMBER_ACCESS: Parser<TokenKind, ExprNode> = lrec_sc(
  PRIMARY_EXPR,
  seq(str("."), PRIMARY_EXPR),
  (left, [op, right]) =>
    new BinaryOperatorNode(
      {
        op: ".",
        left,
        right,
      },
      left.start,
      right.end
    )
);

const IDENTIFIER = apply(
  tok(TokenKind.Identifier),
  (ident) => new IdentifierNode(ident.text, ident, ident)
);

const KEY_VALUE_PAIR = apply(
  seq(IDENTIFIER, str("="), EXPR),
  ([left, _, right]) => [left, right] as [IdentifierNode, ExprNode]
);

type FunctionCallArgs = [ExprNode[], [IdentifierNode, ExprNode][]];

const FUNCTION_CALL: Parser<TokenKind, ExprNode> = lrec_sc(
  BINOP_MEMBER_ACCESS,
  apply(
    seq(
      str("("),
      alt_sc(
        apply(
          seq(
            nonemptyCommaSeparatedList(EXPR),
            str(","),
            nonemptyCommaSeparatedList(KEY_VALUE_PAIR)
          ),
          ([left, _, right]) => [left, right] as FunctionCallArgs
        ),
        apply(
          nonemptyCommaSeparatedList(EXPR),
          (left) => [left, []] as FunctionCallArgs
        ),
        apply(
          nonemptyCommaSeparatedList(KEY_VALUE_PAIR),
          (right) => [[], right] as FunctionCallArgs
        )
      ),
      str(")")
    ),
    ([start, [args, kwargs], end]) =>
      [
        {
          args,
          kwargs,
        },
        start,
        end,
      ] as [
        { args: ExprNode[]; kwargs: [IdentifierNode, ExprNode][] },
        Token<TokenKind>,
        Token<TokenKind>
      ]
  ),
  (fn, [params, start, end]) => new CallNode({ fn, ...params }, start, end)
);

const BINOP_MUL_DIV_MOD = makeBinOpRule(
  apply(
    alt_sc(str("*"), str("/"), str("%")),
    (tkn) => tkn.text as BinaryOperator
  ),
  FUNCTION_CALL
);

const BINOP_ADD_SUB = makeBinOpRule(
  apply(alt_sc(str("+"), str("-")), (t) => t.text as BinaryOperator),
  BINOP_MUL_DIV_MOD
);

const BINOP_COMPARISON = makeBinOpRule(
  apply(
    alt_sc(str("=="), str("!="), str(">"), str("<"), str(">="), str("<=")),
    (t) => t.text as BinaryOperator
  ),
  BINOP_ADD_SUB
);

const BINOP_AND = makeBinOpRule(
  apply(str("&&"), (t) => t.text as BinaryOperator),
  BINOP_COMPARISON
);

const BINOP_OR = makeBinOpRule(
  apply(str("||"), (t) => t.text as BinaryOperator),
  BINOP_AND
);

EXPR.setPattern(BINOP_OR);

export function parseExpr(str: string) {
  const lexed = lexer.parse(str);
  return expectSingleResult(expectEOF(EXPR.parse(lexed)));
}
