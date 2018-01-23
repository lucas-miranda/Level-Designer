import Tool, { ToolAction } from './Tool';
import Input, { MouseButtons } from '../Input';
import Graphics from '../Graphics/Graphics';
import Draw from '../Draw';
import Surface from '../Surface';
import Line from '../Math/Line';
import Settings from '../Settings';

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
        let pointerPos = Input.pointerPos;
        let rectBrush = new PIXI.Rectangle(pointerPos.x - this.radius, pointerPos.y - this.radius, (this.radius * 2) + 1, (this.radius * 2) + 1);

        Draw.rectangle(rectBrush.x, rectBrush.y, rectBrush.width, rectBrush.height, null, { color: 0x3E3E3E });

        if (!this.isErasing) {
            return;
        }

        Tool.bufferGraphicsContext.clear();
        Tool.bufferGraphicsContext.drawRectangle(rectBrush.x, rectBrush.y, rectBrush.width, rectBrush.height, { color: Settings.clearColor, alpha: 1 });
        surface.draw(Tool.bufferGraphicsContext);
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
