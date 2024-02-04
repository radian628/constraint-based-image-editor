import { FsPromisesApi } from "memfs/lib/node/types";
import {
  Displayable,
  Primitive,
  ShaderLink,
  extractMatrix3x3,
} from "../image-format/image-format.js";
import { matMul } from "../linalg/matrix.js";
import { setUniforms } from "./gl-utils.js";

export type CachedWebGLState = {
  unitSquareBuffer: WebGLBuffer;
  getShaderProgram: (
    vshaderLink: ShaderLink,
    fshaderLink: ShaderLink
  ) => WebGLProgram;
};

export type RenderArgs = {
  // relevant APIs
  gl: WebGL2RenderingContext;
  fs: FsPromisesApi;
  cgls: CachedWebGLState;

  // current 3x3 transformation matrix
  // it's 3x3 to allow translation
  matrix: number[];
};

export function render(args: RenderArgs, draw: Displayable) {
  const transformMatrix = matMul(
    extractMatrix3x3(draw.matrix),
    3,
    args.matrix,
    3
  );

  if (draw.type === "group") {
  } else if (draw.type === "primitive") {
    renderPrimitive(
      {
        ...args,
        matrix: transformMatrix,
      },
      draw.data
    );
  }
}

function renderPrimitive(args: RenderArgs, draw: Primitive) {
  const { gl, cgls } = args;

  switch (draw.type) {
    case "rect":
      const prog = cgls.getShaderProgram(
        "builtin:shader/basic-vert.vert",
        "builtin:shader/flat-color.frag"
      );

      gl.useProgram(prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, cgls.unitSquareBuffer);
      gl.vertexAttribPointer(
        gl.getAttribLocation(prog, "in_position"),
        2,
        gl.FLOAT,
        false,
        8,
        0
      );

      gl.uniformMatrix3fv(
        gl.getUniformLocation(prog, "transform"),
        false,
        args.matrix
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
