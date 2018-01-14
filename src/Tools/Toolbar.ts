import Input from '../Input';
import { capitalize, createInstance } from '../Util/Helper';
import Tool from './Tool';
import * as Tools from './Tools';
import Surface from '../Surface';

export default class Toolbar {
    private tools: Map<string, Tool>;
    public element: HTMLElement;
    public selectedTool: Tool;

    constructor() {
        this.tools = new Map<string, Tool>();
        this.element = document.getElementById('toolbar');
    }

    public update(delta: number) {
        if (this.selectedTool === undefined) {
            return;
        }

        this.selectedTool.update(delta);
    }

    public render(surface: Surface) {
        if (this.selectedTool === undefined) {
            return;
        }

        this.selectedTool.render(surface);
    }

    public findToolByName(toolName: string): Tool {
        return this.tools.get(toolName);
    }

    public selectTool(tool: Tool) {
        if (tool === undefined || tool === null) {
            console.error('Attempt to select a undefined tool.');
            return;
        }

        if (tool === this.selectedTool) {
            return;
        }

        if (this.selectedTool !== undefined) {
            this.selectedTool.element.classList.remove('toolbar-button-active');
            this.selectedTool.onDeselected();
        }

        this.selectedTool = tool;
        this.selectedTool.element.classList.add('toolbar-button-active');
        this.selectedTool.onSelected();
    }

    public selectToolByName(toolName: string) {
        this.selectTool(this.findToolByName(toolName));
    }

    public registerTool(toolName: string) {
        if (this.tools.has(toolName)) {
            return;
        }

        let toolBtn = document.getElementById(toolName + '-tool');
        let tool: Tool = createInstance(Tools, capitalize(toolName) + "Tool", toolBtn) as Tool;
        this.tools.set(toolName, tool);

        // button events
        let toolbar = this;
        toolBtn.addEventListener('click', () => toolbar.selectToolByName(toolName));
    }

    public registerTools(...toolNames: string[]) {
        for (let toolName of toolNames) {
            this.registerTool(toolName);
        }
    }
}
