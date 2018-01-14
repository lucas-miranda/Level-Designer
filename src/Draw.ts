import Graphics from './Graphics/Graphics';

export default class Draw {
    public static graphicsContext: Graphics;

    public static get lineWidth(): number {
        return Draw.graphicsContext.lineWidth;
    }

    public static set lineWidth(width: number) {
        Draw.graphicsContext.lineWidth = width;
    }

    public static get lineColor(): number {
        return Draw.graphicsContext.lineColor;
    }

    public static set lineColor(color: number) {
        Draw.graphicsContext.lineColor = color;
    }

    public static start(container: PIXI.Container) {
        Draw.graphicsContext = Graphics.create(container);
    }

    public static lineStyle(color: number, lineWidth?: number, alpha?: number): void {
        Draw.graphicsContext.lineStyle(color, lineWidth, alpha);
    }

    public static grid(viewport: PIXI.Rectangle, cellSize: Size): void {
        Draw.graphicsContext.drawGrid(viewport, cellSize);
    }

    public static line(x0: number, y0: number, x1: number, y1: number): void {
        Draw.graphicsContext.drawLine(x0, y0, x1, y1);
    }

    public static clear(): void {
        Draw.graphicsContext.clear();
    }
}
