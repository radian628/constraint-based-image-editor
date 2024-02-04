class LinalgError extends Error {
    constructor(msg) {
        super(msg);
    }
}
export function matMul(mat1, width1, mat2, width2) {
    const height1 = mat1.length / width1;
    const height2 = mat2.length / width2;
    if (width1 !== height2) {
        throw new LinalgError(`Cannot multiply matrices of size ${height1}x${width1} and ${height2}x${width2}`);
    }
    const outWidth = width2;
    const outHeight = height1;
    const dotProdSize = width1;
    const out = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0cml4LmpzIiwic291cmNlUm9vdCI6IkM6L1VzZXJzL2Jha2VyL0RvY3VtZW50cy9HaXRIdWIvY29uc3RyYWludC1iYXNlZC1pbWFnZS1lZGl0b3IvIiwic291cmNlcyI6WyJzcmMvbGluYWxnL21hdHJpeC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFdBQVksU0FBUSxLQUFLO0lBQzdCLFlBQVksR0FBVztRQUNyQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDYixDQUFDO0NBQ0Y7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUNwQixJQUFjLEVBQ2QsTUFBYyxFQUNkLElBQWMsRUFDZCxNQUFjO0lBRWQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFFckMsSUFBSSxNQUFNLEtBQUssT0FBTyxFQUFFLENBQUM7UUFDdkIsTUFBTSxJQUFJLFdBQVcsQ0FDbkIsb0NBQW9DLE9BQU8sSUFBSSxNQUFNLFFBQVEsT0FBTyxJQUFJLE1BQU0sRUFBRSxDQUNqRixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUN4QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUM7SUFFMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDO0lBRTNCLE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztJQUV6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3JDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2QixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9