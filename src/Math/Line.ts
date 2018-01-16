import Point from './Point';

export default class Line {
    public start: Point;
    public end: Point;

    constructor(x0?: number, y0?: number, x1?: number, y1?: number) {
        this.start = new Point(x0 || 0, y0 || 0);
        this.end = new Point(x1 || 0, y1 || 0);
    }
}
