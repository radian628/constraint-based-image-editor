#version 300 es

in vec2 in_position;
out vec2 position;

uniform mat3 transform;

void main() {
  const pos = (transform * vec3(in_position, 1.0)).xy;
  position = pos;
  gl_FragCoord = pos;
}