import { ASTNode } from "./ast.js";

export type Type =
  | Primitive
  | Fn
  | Sum
  | NamedProduct
  | Product
  | Array
  | TypeError;

export type Primitive = {
  type: "int" | "float" | "string" | "bool";
  aliasName?: string;
};

export type Fn = {
  type: "fn";
  aliasName?: string;
  args: {
    name: string;
    type: Type;
  }[];
  kwArgs: {
    name: string;
    type: Type;
  }[];
  return: Type;
};

export type Sum = {
  type: "sum";
  aliasName?: string;
  alternatives: {
    name: string;
    type: Type;
  }[];
};

export type NamedProduct = {
  type: "named-product";
  aliasName?: string;
  fields: {
    name: string;
    type: Type;
  }[];
};

export type Product = {
  type: "product";
  aliasName?: string;
  fields: Type[];
};

export type Array = {
  type: "array";
  aliasName?: string;
  element: Type;
};

export type TypeErrorReason =
  | {
      type: "mismatch";
      expected: Type;
      actual: Type;
    }
  | {
      type: "return-type-mismatch";
      fn: Fn;
      mismatch: TypeErrorReason[];
    }
  | {
      type: "arg-type-mismatch";
      fn: Fn;
      mismatch: TypeErrorReason[];
      name: string;
      index?: number;
    }
  | {
      type: "does-not-exist";
      expected: Type;
    };

export type TypeError = {
  type: "type-error";
  aliasName?: string;
  why: TypeErrorReason[];
};
