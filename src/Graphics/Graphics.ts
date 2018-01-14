import Graphic from './Graphic';

export default class Graphics extends Graphic {
    private _graphicsContext: PIXI.Graphics;

    constructor(graphicsContext: PIXI.Graphics) {
        super(graphicsContext);
        this._graphicsContext = graphicsContext;
    }

    public get lineWidth(): number {
        return this._graphicsContext.lineWidth;
    }

    public set lineWidth(width: number) {
        this._graphicsContext.lineWidth = width;
    }

    public get lineColor(): number {
        return this._graphicsContext.lineColor;
    }

    public set lineColor(color: number) {
        this._graphicsContext.lineColor = color;
    }

    public static create(container: PIXI.Container): Graphics {
        let PIXI_graphics = new PIXI.Graphics(true);
        let graphics = new Graphics(PIXI_graphics);
        container.addChild(PIXI_graphics);
        return graphics;
    }

    public lineStyle(color: number, lineWidth?: number, alpha?: number): void {
        this._graphicsContext.lineStyle(lineWidth || 1, color, alpha);
    }

    public drawGrid(viewport: PIXI.Rectangle, cellSize: Size): void {
        let columns = viewport.width / cellSize.width,
            rows = viewport.height / cellSize.height;

        for (var column = 0; column <= columns; column++) {
            let x = viewport.left + column * cellSize.width;
            this.drawLine(x, viewport.top, x, viewport.bottom);
        }

        for (var row = 0; row <= rows; row++) {
            let y = viewport.top + row * cellSize.height;
            this.drawLine(viewport.left, y, viewport.right, y);
        }

        this.lineWidth = 1.5;

        if (viewport.top < 0) {
            let x = viewport.left + (columns / 2) * cellSize.width;
            this.drawLine(x, viewport.top, x, viewport.bottom);
        }

        if (viewport.left < 0) {
            let y = viewport.top + (rows / 2) * cellSize.height;
            this.drawLine(viewport.left, y, viewport.right, y);
        }

        this.lineWidth = 1;
    }

    public drawLine(x0: number, y0: number, x1: number, y1: number): void {
        this._graphicsContext.moveTo(x0, y0);
        this._graphicsContext.lineTo(x1, y1);
    }

    public clear(): void {
        this._graphicsContext.clear();
    }
}
