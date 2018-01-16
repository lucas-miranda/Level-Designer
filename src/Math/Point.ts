import { clamp } from '../Util/Helper';

export default class Point {
    public static ZERO = new Point();
    public static ONE = new Point(1);

    public x: number;
    public y: number;

    constructor(x?: number, y?:number) {
        if (x !== undefined && y === undefined) {
            this.x = this.y = x;
            return;
        }

        this.x = x || 0;
        this.y = y || 0;
    }

    public static fromPoint(point: PIXI.Point | PIXI.ObservablePoint | Point): Point {
        return new Point(point.x, point.y);
    }

    public static fromSize(size: Size): Point {
        return new Point(size.width, size.height);
    }

    public static negate(point: Point): Point {
        return Point.fromPoint(point).negate();
    }

    public static add(point: Point, x: number | Point, y?: number): Point {
        return Point.fromPoint(point).add(x, y);
    }

    public static subtract(point: Point, x: number | Point, y?: number): Point {
        return Point.fromPoint(point).subtract(x, y);
    }

    public static multiply(point: Point, x: number | Point, y?: number): Point {
        return Point.fromPoint(point).multiply(x, y);
    }

    public static divide(point: Point, x: number | Point, y?: number): Point {
        return Point.fromPoint(point).divide(x, y);
    }

    public static clamp(value: Point, min: Point, max: Point): Point {
        return new Point(clamp(value.x, min.x, max.x), clamp(value.y, min.y, max.y));
    }

    public negate(): Point {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    public add(x: number | Point, y?: number): Point {
        if (x instanceof Point) {
            this.x += x.x;
            this.y += x.y;
            return this;
        }

        this.x += x;
        this.y += y || x;
        return this;
    }

    public subtract(x: number | Point, y?: number): Point {
        if (x instanceof Point) {
            this.x -= x.x;
            this.y -= x.y;
            return this;
        }

        this.x -= x;
        this.y -= y || x;
        return this;
    }

    public multiply(x: number | Point, y?: number): Point {
        if (x instanceof Point) {
            this.x *= x.x;
            this.y *= x.y;
            return this;
        }

        this.x *= x;
        this.y *= y || x;
        return this;
    }

    public divide(x: number | Point, y?: number): Point {
        if (x instanceof Point) {
            this.x /= x.x;
            this.y /= x.y;
            return this;
        }

        this.x /= x;
        this.y /= y || x;
        return this;
    }

    public toString(): string {
        return `[${this.x}, ${this.y}]`;
    }
}
