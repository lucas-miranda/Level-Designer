import Input, { Button } from '../Input';
import Surface from '../Surface';
import Graphics from '../Graphics/Graphics';
import { capitalize } from '../Util/Helper';

export default abstract class Tool {
    public static bufferGraphicsContext: Graphics;
    
    public name: string;
    public element: HTMLElement;
    public actions: Map<string, ToolAction> = new Map<string, ToolAction>();

    constructor(name: string, element: HTMLElement) {
        this.name = name;
        this.element = element;
    }

    public update(delta: number): void {
        for (let action of this.actions.values()) {
            action.update(delta);
        }
    }

    public abstract render(surface: Surface): void;

    public onSelected(): void {
        for (let action of this.actions.values()) {
            action.bind();
        }
    }

    public onDeselected(): void {
        for (let action of this.actions.values()) {
            action.unbind();
        }
    }

    public registerAction(name: string, button: Button): Tool {
        this.actions.set(name, new ToolAction(name, button, this));
        return this;
    }

    public toString(): string {
        return `[${this.name}]`;
    }
}

export class ToolAction {
    // functions
    private _startFunc: string;
    private _updateFunc: string;
    private _endFunc: string;

    private _requestedRestart: boolean = false;
    public parent: Tool;
    public name: string;
    public button: Button;

    constructor(name: string, button: Button, parent: Tool) {
        this.parent = parent;
        this.name = name;
        this.button = button;
        let capitalizedName = capitalize(name);
        this._startFunc = `on${capitalizedName}Start`;
        this._updateFunc = `on${capitalizedName}Update`;
        this._endFunc = `on${capitalizedName}End`;
    }

    public update(delta: number): void {
    }

    public bind(): void {
        this.button.addListener('pressed', this.onStart, this)
                   .addListener('down', this.onUpdate, this)
                   .addListener('released', this.onEnd, this);
    }

    public unbind(): void {
        this._requestedRestart = false;
        this.button.removeListener('pressed', this.onStart)
                   .removeListener('down', this.onUpdate)
                   .removeListener('released', this.onEnd);
   }

    public requestRestart(): void {
        this._requestedRestart = true;
    }

    private onStart(this: ToolAction): void {
        if (this._requestedRestart) {
            this._requestedRestart = false;
        }

        this.parent[this._startFunc]();
    }

    private onUpdate(this: ToolAction): void {
        if (this._requestedRestart) {
            return;
        }

        this.parent[this._updateFunc]();
    }

    private onEnd(this: ToolAction): void {
        if (this._requestedRestart) {
            return;
        }

        this.parent[this._endFunc]();
    }
}
