import { parser } from "@shaderfrog/glsl-parser";

export function extractShaderUniforms(src: string) {
  const program = parser.parse(src);

  const uniforms: string[] = [];

  for (const node of program.program) {
    if (node.type !== "declaration_statement") continue;

    if (node.declaration.type !== "declarator_list") continue;

    if (
      node.declaration.specified_type.qualifiers?.find(
        (q) => q.type === "keyword" && q.token === "uniform"
      )
    ) {
      uniforms.push(node.declaration.declarations[0].identifier.identifier);
    }
  }

  return uniforms;
}
