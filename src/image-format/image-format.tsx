export type ShaderLink = string;
export type JSLink = string;

export type Displayable = {
  name: string;
  blendShader: ShaderLink;
  matrix: Matrix3x3;
} & (
  | {
      type: "group";
      data: Group;
    }
  | {
      type: "primitive";
      data: Primitive;
    }
);

export type Group = {
  constituents: Primitive[];
};

export type Color =
  | {
      type: "rgba";
      color: number;
    }
  /*
     Color fragment shaders take everything that's already rendered
     as a texture and let you do what you want with it.
    */
  | {
      type: "fragment-shader";
      shader: ShaderLink;
      textures: {
        [uniformVarName: string]: string;
      };
    };

export type Numerical = {
  type: "number";
  data: number;
};

export function extractNumerical(v: Numerical) {
  return v.data;
}

export type Vector2 = {
  type: "vec2";
  data: [number, number];
};

export function extractVector2(v: Vector2) {
  return v.data;
}

export type Matrix3x3 = {
  type: "mat3";
  data: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];
};

export function extractMatrix3x3(v: Matrix3x3) {
  return v.data;
}

export type Primitive = {
  type: "rect";
  data: {
    a: Vector2;
    b: Vector2;
  };
  color: Color;
};

export type ImageFormat = {};
