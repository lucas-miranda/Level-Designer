import Tool, { ToolAction } from './Tool';
import Input, { MouseButtons } from '../Input';
import Graphics from '../Graphics/Graphics';
import Draw from '../Draw';
import Surface from '../Surface';
import Line from '../Math/Line';

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
    constructor(element: HTMLButtonElement) {
        super("eraser", element);
        this.registerAction('erase', Input.mouseButton(MouseButtons.Main));
    }

    public render(surface: Surface) {
    }

    public onSelected(): void {
        super.onSelected();
    }

    private onEraseStart(): void {
    }
    
    private onEraseUpdate(): void {
    }

    private onEraseEnd(): void {
    }
}
