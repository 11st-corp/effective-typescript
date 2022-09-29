interface Point {
    x: number;
    y: number;
}
type PointKeys = keyof Point;

function sortBy<K extends keyof T, T>(vals: T[], key: K): T[] {
    // ...
}
const pts: Point[] = [{x: 1, y:1}, {x: 2, y: 0}]

sortBy(pts, '')
sortBy(pts, 'x')
sortBy(pts, 'y')
sortBy(pts, Math.random() < 0.5 ? 'x' : 'y')
sortBy(pts, 'z')

const tuple_1: [number, number] = [1,2];
const list_1: number[] = tuple_1

const list_2 = [1, 2]
const tuple_2: [number, number] = list_2;
