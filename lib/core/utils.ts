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
