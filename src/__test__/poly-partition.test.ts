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

type Testcase = {
    polygon: Contour,
    holes: Contour[]
};

const testcase: Testcase[] = [
    {
        polygon: createRegular(10, 100, 0, 0),
        holes: [
            createRegular(10, 25, 60, 0).reverse(),
            createRegular(3, 25, -25, 20).reverse()
        ]
    },
    {
        polygon: [
            {x: 0, y: 0}, {x: 3, y: 0}, {x: 3, y: 2}, {x: 2, y: 2}, {x: 2, y: 1}, {x: 1, y: 1},
            {x: 1, y: 2}, {x: 2, y: 2}, {x: 2, y: 3}, {x: 1, y: 3}, {x: 1, y: 4}, {x: -2, y: 4},
            {x: -2, y: 1}, {x: 0, y: 1}
        ],
        holes: [
            [{x: 0, y: 2}, {x: -1, y: 2}, {x: -1, y: 3}, {x: 0, y: 3}]
        ]
    },
    {
        polygon: [
            {x: 0, y: 0}, {x: 3, y: 0}, {x: 3, y: 3}, {x: 1, y: 3}, {x: 1, y: 4}, {x: -2, y: 4},
            {x: -2, y: 1}, {x: 0, y: 1}
        ],
        holes: [
            [{x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 2, y: 1}],
            [{x: 0, y: 2}, {x: -1, y: 2}, {x: -1, y: 3}, {x: 0, y: 3}]
        ]
    },
    {
        polygon: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 2}, {x: 2, y: 2}, {x: 2, y: 3}, {x: 0, y: 3},
            {x: 0, y: 2}, {x: 1, y: 2}, {x: 1, y: 1}, {x: 2, y: 1}
        ],
        holes: []
    },
    {
        polygon: [
            {x: 0, y: -1}, {x: 0, y: 0}, {x: -3, y: 0}, {x: -3, y: -1}, {x: -4, y: -1}, {x: -4, y: -4},
            {x: -3, y: -4}, {x: -3, y: -2}, {x: -2, y: -2}, {x: -2, y: -1}
        ],
        holes: []
    },
    {
        polygon: [
            {x: 0, y: 0}, {x: 3, y: 0}, {x: 3, y: 3}, {x: 1, y: 3}, {x: 1, y: 2}, {x: 2, y: 2},
            {x: 2, y: 1}, {x: 0, y: 1}
        ],
        holes: []
    }
];

testcase.forEach((testcase, index) => {
    const polygonArea = signedArea(testcase.polygon);
    const holesArea = testcase.holes.map(signedArea).reduce((sum, curr) => (sum + curr), 0);
    const expectedArea = polygonArea + holesArea;

    const merged = removeHoles(testcase.polygon, testcase.holes, true);

    test(`removeHoles [${index}]`, () => {
        expect(equals(signedArea(merged), expectedArea)).toBe(true);
        expect(isClockwise(merged)).toBe(false);
    });

    test(`triangulate [${index}]`, () => {
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

    test(`convexPartition [${index}]`, () => {
        const polygons = convexPartition(merged, true);
        polygons.forEach(polygon => {
            expect(isClockwise(polygon)).toBe(false);
            expect(isConvex(polygon)).toBe(true);
        });
        let areaSum = 0;
        polygons.forEach(polygon => {
            areaSum += signedArea(polygon);
        });
        if (!equals(areaSum, expectedArea)) {
            console.log(testcase, areaSum, polygonArea, holesArea);
        }
        expect(equals(areaSum, expectedArea)).toBe(true);
    });
});
