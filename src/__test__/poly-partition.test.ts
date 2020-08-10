import {removeHoles, triangulate, convexPartition} from '../index'

type Point = { x: number, y: number };
type Contour = Point[];

function signedArea(polygon: Contour) {
    let area = 0;
    for (let i = 0, len = polygon.length; i < len; ++i) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % len];
        area += p1.x * p2.y - p1.y * p2.x;
    }
    return area;
}

function isClockwise(polygon: Contour) {
    let sum = 0;
    for (let i = 0, len = polygon.length; i < len; ++i) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % len];
        sum += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return sum > 0;
}

function isConvex(polygon: Contour) {
    if (polygon.length < 3) {
        return false;
    }
    for (let i = 0, len = polygon.length; i < len; ++i) {
        const a = polygon[i];
        const b = polygon[(i + 1) % len];
        const c = polygon[(i + 2) % len];
        if ((b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y) > 0) {
            return false;
        }
    }
    return true;
}

function equals(a: number, b: number) {
    return Math.abs(a - b) < 1e-5;
}

function createRegular(num: number, radius: number, dx: number = 0, dy: number = 0) {
    const vertices: Contour = [];
    const rad = Math.PI * 2 / num;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    let x = radius;
    let y = 0;
    for (let i = num; i--;) {
        const px = x * cos - y * sin;
        const py = x * sin + y * cos;
        x = px;
        y = py;
        vertices.push({x: x + dx, y: y + dy});
    }
    return vertices;
}

const polygon = createRegular(10, 100, 0, 0);
const hole1 = createRegular(10, 25, 60, 0).reverse();
const hole2 = createRegular(3, 25, -25, 20).reverse();
const polygonArea = signedArea(polygon);
const hole1Area = signedArea(hole1);
const hole2Area = signedArea(hole2);
const expectedArea = polygonArea + hole1Area + hole2Area;

const merged = removeHoles(polygon, [hole1, hole2], true);

test('removeHoles', () => {
    expect(equals(signedArea(merged), expectedArea)).toBe(true);
    expect(isClockwise(merged)).toBe(false);
});

test('triangulate', () => {
    const triangles = triangulate(merged, true);
    triangles.forEach(triangle => {
        expect(isClockwise(triangle)).toBe(false);
    });
    let areaSum = 0;
    triangles.forEach(triangle => {
        areaSum += signedArea(triangle);
    });
    expect(equals(areaSum, expectedArea)).toBe(true);
});

test('convexPartition', () => {
    const polygons = convexPartition(merged, true);
    polygons.forEach(polygon => {
        expect(isClockwise(polygon)).toBe(false);
        expect(isConvex(polygon)).toBe(true);
    });
    let areaSum = 0;
    polygons.forEach(polygon => {
        areaSum += signedArea(polygon);
    });
    expect(equals(areaSum, expectedArea)).toBe(true);
});
