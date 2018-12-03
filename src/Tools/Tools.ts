import { TargetMode } from '../TargetMode';
import Tool, { ToolAction } from './Tool';
import Input, { Key, MouseButtons } from '../Input';
import Color from '../Graphics/Color';
import Graphics from '../Graphics/Graphics';
import Draw from '../Draw';
import Surface from '../Surface';
import Point from '../Math/Point';
import Line from '../Math/Line';
import Settings from '../Settings';

export class PencilTool extends Tool {
    private _isPlacing: boolean = false;

    constructor(element: HTMLButtonElement) {
        super('pencil', element);
        this.registerAction('place', Input.mouseButton(MouseButtons.Main));
    }

    public render(surface: Surface) {
        switch (Settings.targetMode) {
            case TargetMode.Pixel:
                let pointerPos = Input.pointerPos;

                Draw.rectangle(
                    pointerPos.x,
                    pointerPos.y,
                    1,
                    1,
                    { color: 0x292929, alpha: .3 }
                );

                if (this._isPlacing) {
                    Tool.bufferGraphicsContext.clear();

                    Tool.bufferGraphicsContext.drawRectangle(
                        pointerPos.x,
                        pointerPos.y,
                        1,
                        1,
                        { color: 0x292929, alpha: 1 }
                    );

                    surface.draw(Tool.bufferGraphicsContext);
                }
                break;

            case TargetMode.Tile:
                let pointerGridCell = Input.pointerGridCell;

                Draw.rectangle(
                    pointerGridCell.x * Settings.gridCellSize.width,
                    pointerGridCell.y * Settings.gridCellSize.height,
                    Settings.gridCellSize.width,
                    Settings.gridCellSize.height,
                    { color: 0x292929, alpha: .3 }
                );

                if (this._isPlacing) {
                    Tool.bufferGraphicsContext.clear();

                    fillCellAtGraphicsBuffer(pointerGridCell.x, pointerGridCell.y);

                    surface.draw(Tool.bufferGraphicsContext);
                }
                break;

            default:
                break;
        }
    }

    private onPlaceStart(): void {
        this._isPlacing = true;
    }

    private onPlaceUpdate(): void {
    }

    private onPlaceEnd(): void {
        this._isPlacing = false;
    }
}

export class LineTool extends Tool {
    private _isFirstPoint: boolean = true;
    private _linesToRender: Array<Line> = new Array<Line>();
    public currentLine: Line = new Line(0, 0, 0, 0);

    constructor(element: HTMLButtonElement) {
        super('line', element);
        this.registerAction('place', Input.mouseButton(MouseButtons.Main))
            .registerAction('finish', Input.mouseButton(MouseButtons.Secondary));
    }

    public update(delta: number): void {
        if (!this._isFirstPoint) {
            this.currentLine.end = Input.pointerPos;
        }
    }

    public render(surface: Surface) {
        switch (Settings.targetMode) {
            case TargetMode.Pixel:
                // lines to render
                Tool.bufferGraphicsContext.clear();
                Tool.bufferGraphicsContext.lineStyle(0x292929);
                while (this._linesToRender.length > 0) {
                    let line = this._linesToRender.splice(0, 1)[0];
                    Tool.bufferGraphicsContext.drawLine(line.start.x, line.start.y, line.end.x, line.end.y);
                }

                surface.draw(Tool.bufferGraphicsContext);

                // current line
                if (!this._isFirstPoint) {
                    Draw.lineStyle(0x292929);
                    Draw.line(this.currentLine.start.x, this.currentLine.start.y, this.currentLine.end.x, this.currentLine.end.y);
                }
                break;

            case TargetMode.Tile:
                // current line preview
                if (!this._isFirstPoint) {
                    let startCell = new Point(
                        Math.floor(this.currentLine.start.x / Settings.gridCellSize.width),
                        Math.floor(this.currentLine.start.y / Settings.gridCellSize.height)
                    );

                    let endCell = new Point(
                        Math.floor(this.currentLine.end.x / Settings.gridCellSize.width),
                        Math.floor(this.currentLine.end.y / Settings.gridCellSize.height)
                    );

                    fillCellAtPreview(startCell.x, startCell.y);
                    fillCellAtPreview(endCell.x, endCell.y);
                    CellLine(startCell, endCell, fillCellAtPreview);
                }

                // lines to render
                if (this._linesToRender.length > 0) {
                    Tool.bufferGraphicsContext.clear();
                    //Tool.bufferGraphicsContext.lineStyle(0x292929);
                    while (this._linesToRender.length > 0) {
                        let line = this._linesToRender.splice(0, 1)[0];
                        //Tool.bufferGraphicsContext.drawLine(line.start.x, line.start.y, line.end.x, line.end.y);

                        let startCell = new Point(
                            Math.floor(line.start.x / Settings.gridCellSize.width),
                            Math.floor(line.start.y / Settings.gridCellSize.height)
                        );

                        let endCell = new Point(
                            Math.floor(line.end.x / Settings.gridCellSize.width),
                            Math.floor(line.end.y / Settings.gridCellSize.height)
                        );

                        fillCellAtGraphicsBuffer(startCell.x, startCell.y);
                        fillCellAtGraphicsBuffer(endCell.x, endCell.y);
                        CellLine(startCell, endCell, fillCellAtGraphicsBuffer);
                    }

                    surface.draw(Tool.bufferGraphicsContext);
                }

                break;

            default:
                break;
        }
    }

    public onSelected(): void {
        super.onSelected();
        this._isFirstPoint = true;
    }

    private onPlaceStart(): void {
    }

    private onPlaceUpdate(): void {
    }

    private onPlaceEnd(): void {
        if (this._isFirstPoint) {
            this.currentLine.start = this.currentLine.end = Input.pointerPos;
            this._isFirstPoint = false;
            return;
        }

        this._linesToRender.push(this.currentLine);
        this.currentLine = new Line(this.currentLine.end.x, this.currentLine.end.y, this.currentLine.end.x, this.currentLine.end.y);
    }

    private onFinishStart(): void {
        this._linesToRender.push(this.currentLine);
        this.currentLine = new Line();
        this._isFirstPoint = true;
        this.actions.get('place').requestRestart();
    }

    private onFinishUpdate(): void {
    }

    private onFinishEnd(): void {
    }
}

export class EraserTool extends Tool {
    public isErasing: boolean = false;
    public radius: number = 5;

    constructor(element: HTMLButtonElement) {
        super("eraser", element);
        this.registerAction('erase', Input.mouseButton(MouseButtons.Main));
    }

    public render(surface: Surface) {
        switch (Settings.targetMode) {
            case TargetMode.Pixel:
                let pointerPos = Input.pointerPos;
                let rectBrush = new PIXI.Rectangle(pointerPos.x - this.radius, pointerPos.y - this.radius, (this.radius * 2) + 1, (this.radius * 2) + 1);

                Draw.rectangle(rectBrush.x, rectBrush.y, rectBrush.width, rectBrush.height, null, { color: 0x3E3E3E });

                if (!this.isErasing) {
                    return;
                }

                Tool.bufferGraphicsContext.clear();
                Tool.bufferGraphicsContext.drawRectangle(rectBrush.x, rectBrush.y, rectBrush.width, rectBrush.height, { color: Settings.clearColor, alpha: 1 });
                surface.draw(Tool.bufferGraphicsContext);
                break;

            case TargetMode.Tile:
                let cellPos = Input.pointerGridCell;
                let cellBrush = new PIXI.Rectangle(
                    cellPos.x * Settings.gridCellSize.width,
                    cellPos.y * Settings.gridCellSize.height,
                    Settings.gridCellSize.width,
                    Settings.gridCellSize.height,
                );

                Draw.rectangle(
                    cellBrush.x,
                    cellBrush.y,
                    cellBrush.width,
                    cellBrush.height,
                    null,
                    { color: Color.lighten(new Color(0x3E3E3E), .4).RGB }
                );

                if (!this.isErasing) {
                    return;
                }

                Tool.bufferGraphicsContext.clear();
                Tool.bufferGraphicsContext.drawRectangle(cellBrush.x, cellBrush.y, cellBrush.width, cellBrush.height, { color: Settings.clearColor, alpha: 1 });
                surface.draw(Tool.bufferGraphicsContext);

                break;

            default:
                break;
        }
    }

    public onDeselected(): void {
        super.onDeselected();
        this.isErasing = false;
    }

    private onEraseStart(): void {
        this.isErasing = true;
    }

    private onEraseUpdate(): void {
    }

    private onEraseEnd(): void {
        this.isErasing = false;
    }
}

function CellLine(cellStart: Point, cellEnd: Point, plot: Function) {
    if (Math.abs(cellEnd.y - cellStart.y) < Math.abs(cellEnd.x - cellStart.x)) {
        if (cellStart.x > cellEnd.x) {
            plotLineLow(cellEnd, cellStart, plot);
        } else {
            plotLineLow(cellStart, cellEnd, plot);
        }
    } else {
        if (cellStart.y > cellEnd.y) {
            plotLineHigh(cellEnd, cellStart, plot);
        } else {
            plotLineHigh(cellStart, cellEnd, plot);
        }
    }
}

function plotLineLow(cellStart: Point, cellEnd: Point, plot: Function) {
    let dx = cellEnd.x - cellStart.x;
    let dy = cellEnd.y - cellStart.y;
    let yi = 1;

    if (dy < 0) {
        yi = -1;
        dy = -dy;
    }

    let D = 2 * dy - dx;
    let y = cellStart.y;

    for (let x = cellStart.x; x < cellEnd.x; x++) {
        plot(x, y);

        if (D > 0) {
            y += yi;
            D -= 2 * dx;
        }

        D += 2 * dy;
    }
}

function plotLineHigh(cellStart: Point, cellEnd: Point, plot: Function) {
    let dx = cellEnd.x - cellStart.x;
    let dy = cellEnd.y - cellStart.y;
    let xi = 1;

    if (dx < 0) {
        xi = -1;
        dx = -dx;
    }

    let D = 2 * dx - dy;
    let x = cellStart.x;

    for (let y = cellStart.y; y < cellEnd.y; y++) {
        plot(x, y);

        if (D > 0) {
            x += xi;
            D -= 2 * dy;
        }

        D += 2 * dx;
    }
}

function fillCellAtPreview(x: number, y: number) {
    Draw.rectangle(
        x * Settings.gridCellSize.width,
        y * Settings.gridCellSize.height,
        Settings.gridCellSize.width,
        Settings.gridCellSize.height,
        { color: 0x292929 },
        null
    );
}

function fillCellAtGraphicsBuffer(x: number, y: number) {
    Tool.bufferGraphicsContext.drawRectangle(
        x * Settings.gridCellSize.width,
        y * Settings.gridCellSize.height,
        Settings.gridCellSize.width,
        Settings.gridCellSize.height,
        { color: 0x292929, alpha: 1 },
        null
    );
}
