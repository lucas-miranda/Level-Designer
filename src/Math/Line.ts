
export default class Line {
    public start: PIXI.Point;
    public end: PIXI.Point;

    constructor(x0?: number, y0?: number, x1?: number, y1?: number) {
        this.start = new PIXI.Point(x0 || 0, y0 || 0);
        this.end = new PIXI.Point(x1 || 0, y1 || 0);
    }
}
