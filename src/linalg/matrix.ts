class LinalgError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export function matMul(
  mat1: number[],
  width1: number,
  mat2: number[],
  width2: number
) {
  const height1 = mat1.length / width1;
  const height2 = mat2.length / width2;

  if (width1 !== height2) {
    throw new LinalgError(
      `Cannot multiply matrices of size ${height1}x${width1} and ${height2}x${width2}`
    );
  }

  const outWidth = width2;
  const outHeight = height1;

  const dotProdSize = width1;

  const out: number[] = [];

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      let outMatItem = 0;
      for (let i = 0; i < dotProdSize; i++) {
        outMatItem += mat1[y * width1 + i] * mat2[x + i * width2];
      }
      out.push(outMatItem);
    }
  }

  return out;
}
