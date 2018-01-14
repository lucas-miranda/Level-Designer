import { ipcRenderer } from 'electron';
import * as PIXI from 'pixi.js';
import Settings from './Settings';
import Surface from './Surface';
import Draw from './Draw';
import Graphics from './Graphics/Graphics';
import Graphic from './Graphics/Graphic';
import Toolbar from './Tools/Toolbar';
import Tool from './Tools/Tool';
import Input, { MouseButtons, MouseButton, Key, KeyboardButton } from './Input';
import { clamp } from './Util/Helper';

// - pan
const panMaxSpeed = 16;

// - zoom
const zoomIncFactor = 0.6;
const zoomMin = zoomIncFactor;
const zoomMax = 4.2;

export class Renderer {
    private _renderWrapper: HTMLElement;
    private _app: PIXI.Application;
    private _isReady: boolean = false;
    public toolbar: Toolbar;
    public surface: Surface;
    public bounds: PIXI.Rectangle;
    public lastUpdateDelta: number = 0;

    // grid
    public gridContainer: PIXI.Container;
    public columns: number;
    public rows: number;
    public cellSize: Size;

    // - pan
    private _viewBounds: PIXI.Rectangle;

    // - zoom
    private _zoomFactor: number = 1.0;
    //let zoomTween: Tween;

    debugText: PIXI.Text;

    constructor(options?: PIXI.ApplicationOptions) {
        Settings.renderWrapper = this._renderWrapper = document.getElementById('renderWrapper');
        this._app = new PIXI.Application(options);
        this._renderWrapper.appendChild(this._app.view);
        this._app.renderer.resize(this._renderWrapper.offsetWidth, this._renderWrapper.offsetHeight);

        this._renderWrapper.addEventListener('resize', function (e) {
            let newWidth = this._renderWrapper.offsetWidth, newHeight = this._renderWrapper.offsetHeight;
            this._app.renderer.resize(newWidth, newHeight);
            this.surface.resize(newWidth, newHeight)
            console.log("resize to: ", newWidth, newHeight);
        }, false);

        Settings.size = { width: this._app.renderer.width, height: this._app.renderer.height };

        // additional options
        this._app.renderer.autoResize = true;
        this._app.renderer.roundPixels = true;

        // input
        Input.start(this.interactionManager);

        // grid
        this.gridContainer = new PIXI.Container();
        this._app.stage.addChild(this.gridContainer);

        // graphics
        Draw.start(this.gridContainer);

        // toolbar
        Tool.bufferGraphicsContext = Graphics.create(this.gridContainer);
        this.toolbar = new Toolbar();
        this.toolbar.registerTools('line', 'eraser');

        // callbacks
        this.start();
        let renderer = this;
        this._app.ticker.add(function (delta: number) {
            renderer.lastUpdateDelta = delta;
            renderer.beforeUpdate();
            renderer.update(delta);
            renderer.lateUpdate();
            renderer.render();
        });
    }

    public get interactionManager(): PIXI.interaction.InteractionManager {
        return this._app.renderer.plugins.interaction;
    }

    public get width(): number {
        return this._app.renderer.width;
    }

    public get height(): number {
        return this._app.renderer.height;
    }

    public get size(): Size {
        return { width: this.width, height: this.height };
    }

    public get viewBounds(): PIXI.Rectangle {
        return this._viewBounds;
    }

    public set viewBounds(bounds: PIXI.Rectangle) {
        this._viewBounds = bounds;
        this.gridContainer.setTransform(-this.viewBounds.x, -this.viewBounds.y, this.zoom, this.zoom);
    }

    public set viewPosition(position: PIXI.Point) {
        this._viewBounds.x = position.x;
        this._viewBounds.y = position.y;
        this.gridContainer.setTransform(-this.viewBounds.x, -this.viewBounds.y, this.zoom, this.zoom);
    }

    public get zoom(): number {
        return this._zoomFactor;
    }

    public set zoom(factor: number) {
        this._zoomFactor = factor;
        this.gridContainer.setTransform(-this.viewBounds.x, -this.viewBounds.y, factor, factor);
    }

    public setupGrid(columns: number, rows: number, cellSize: Size) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = cellSize;
        this.bounds = new PIXI.Rectangle(0, 0, columns * cellSize.width, rows * cellSize.height);

        // graphics
        this.surface = new Surface(this._app.renderer, this.bounds.width, this.bounds.height);
        this._app.stage.addChild(this.surface.sprite);
        this._isReady = true;
    }

    protected start() {
        // pan
        this.viewBounds = new PIXI.Rectangle(0, 0, this.width, this.height);
        Input.mouseButton(MouseButtons.Secondary)
                .addListener('down', function() {
                    let screenCenter = new PIXI.Point(this.width / 2.0, this.height / 2.0);
                    let panMovement = new PIXI.Point((Input.pointerPos.x - screenCenter.x) / screenCenter.x, (Input.pointerPos.y - screenCenter.y) / screenCenter.y);
                    panMovement.set(panMovement.x * panMaxSpeed * this.zoom, panMovement.y * panMaxSpeed * this.zoom);
                    this.viewPosition = new PIXI.Point(this.viewBounds.x + panMovement.x, this.viewBounds.y + panMovement.y);
                }, this);

        this.debugText = new PIXI.Text('', { fontFamily: 'Arial', fontSize: 12, fill: 0xff00ff, align: 'center' });
        this._app.stage.addChild(this.debugText);
    }

    protected beforeUpdate(): void {
        Input.update(this.lastUpdateDelta);
    }

    protected update(delta: number): void {
        this.debugText.text = `MousePos: [${Input.pointerPos.x}, ${Input.pointerPos.y}]`;
        this.toolbar.update(delta);

        // zoom
        if (Input.wheelDelta !== 0) {
            let inc = zoomIncFactor * Math.sign(Input.wheelDelta);
            this.zoom = clamp(this.zoom + inc, zoomMin, zoomMax);
            /*zoomTween = tween(game.world.scale)
                                    .to({ x: zoom, y: zoom }, 600, Easing.Sinusoidal.Out, true, 0, 0, false);*/
        }
    }

    protected lateUpdate(): void {
        Input.lateUpdate();
    }

    protected render(): void {
        if (!this._isReady) {
            return;
        }

        Draw.clear();
        Draw.lineStyle(0xCAEBFD);
        Draw.grid(this.bounds, this.cellSize);
        this.toolbar.render(this.surface);
    }
}

let options = {
    transparent: true,
    antialias: false
};

let renderer: Renderer;
renderer = new Renderer(options);

// messages
ipcRenderer.on('setup', (event, columns, rows, size) => {
    renderer.setupGrid(columns, rows, size);
});

ipcRenderer.send('request-setup');
