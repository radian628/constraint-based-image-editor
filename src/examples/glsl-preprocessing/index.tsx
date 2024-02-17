import { parser } from "@shaderfrog/glsl-parser";
import { extractShaderUniforms } from "../../renderer/extract-shader-uniforms.js";

const testshadersrc = `#version 300 es

uniform float test;
uniform int fart;
uniform vec4 aksdjasd;
uniform mat3 transform;

vec3 test2;

void main() {

}

`;

const program = parser.parse(testshadersrc);

console.log(program);

console.log(extractShaderUniforms(testshadersrc));
