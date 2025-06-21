export function parseC3Array<T extends any[]>(
    c2: C3React.ArrayJson<T>
): { [K in keyof T]: T[K] }[] {
    const rows = c2.size[0]; // количество строк (внешний массив)
    const cols = c2.size[1]; // количество столбцов

    const result: { [K in keyof T]: T[K] }[] = [];

    for (let r = 0; r < rows; r++) {
        const row: any = {};

        for (let c = 0; c < cols; c++) {
            row[c] = c2.data[r][c][0]; // из [значение] достаём .[0]
        }

        result.push(row);
    }

    return result as { [K in keyof T]: T[K] }[];
}

export function choose(...numbers: number[]) {
    const index = Math.floor(Math.random() * numbers.length);
    return numbers[index];
}

export function rgbToVec3(rgb: Vec3Arr) {
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255] as Vec3Arr satisfies Vec3Arr;
}

export function lerp(a: number, b: number, c: number) {
    return (a + (b - a) * c);
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
