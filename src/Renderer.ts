import { ipcRenderer } from 'electron';
import * as PIXI from 'pixi.js';
import Settings from './Settings';
import { TargetMode } from './TargetMode';
import Surface from './Surface';
import Draw from './Draw';
import Graphics from './Graphics/Graphics';
import Graphic from './Graphics/Graphic';
import Toolbar from './Tools/Toolbar';
import Tool from './Tools/Tool';
import Input, { MouseButtons, MouseButton, Key, KeyboardButton } from './Input';
import Point from './Math/Point';
import { clamp } from './Util/Helper';

// - pan
const panMaxSpeed = 16;
const panOutOfGridHorizontalSpacingFactor = 0.15;
const panOutOfGridVerticalSpacingFactor = 0.15;

// - zoom
const zoomIncFactor = 0.6;
const zoomMin = zoomIncFactor;
const zoomMax = 4.2;

export class Renderer {
    private _renderWrapper: HTMLElement;
    private _statusBarElements: Map<string, HTMLElement> = new Map<string, HTMLElement>();
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

    // - pan
    private _viewBounds: PIXI.Rectangle;
    private _pointerAnchorPos: Point;

    // - zoom
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

        Settings.rendererSize = { width: this._app.renderer.width, height: this._app.renderer.height };

        // additional options
        this._app.renderer.autoResize = true;
        this._app.renderer.roundPixels = true;

        // grid
        this.gridContainer = new PIXI.Container();
        this._app.stage.addChild(this.gridContainer);

        // input
        Input.start(this.interactionManager, this.gridContainer);

        // toolbar
        Tool.bufferGraphicsContext = Graphics.create(this.gridContainer);
        this.toolbar = new Toolbar();
        this.toolbar.registerTools('pencil', 'line', 'eraser');

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

    public get viewBounds(): PIXI.Rectangle {
        return this._viewBounds;
    }

    public set viewBounds(bounds: PIXI.Rectangle) {
        this._viewBounds = bounds;
    }

    public get viewPosition(): Point {
        return new Point(this._viewBounds.x, this._viewBounds.y);
    }

    public set viewPosition(position: Point) {
        this._viewBounds.x = position.x;
        this._viewBounds.y = position.y;
    }

    public get zoom(): number {
        return Settings.currentZoomFactor;
    }

    public set zoom(factor: number) {
        Settings.currentZoomFactor = factor;
    }

    public setupGrid(columns: number, rows: number, cellSize: Size) {
        this.columns = columns;
        this.rows = rows;
        Settings.gridCellSize = cellSize;
        Settings.gridSize = { width: columns * cellSize.width, height: rows * cellSize.height };
        this.bounds = new PIXI.Rectangle(0, 0, Settings.gridSize.width, Settings.gridSize.height);
        this._viewBounds = new PIXI.Rectangle(0, 0, Settings.gridSize.width, Settings.gridSize.height);

        // graphics
        if (this.surface === undefined) {
            this.surface = new Surface(this._app.renderer as PIXI.WebGLRenderer, this.bounds.width, this.bounds.height);
            this.gridContainer.addChild(this.surface.sprite);
            this._isReady = true;
        } else {
            this.surface.setup(this.bounds.width, this.bounds.height);
        }

        // draw
        if (Draw.graphicsContext === undefined) {
            Draw.start(this.gridContainer);
        }

        this.resetView();
    }

    public centralizeView() {
        // calculate centralized view if it's smaller than renderer wrapper size
        let rendererCenter = Point.fromSize(Settings.halfRendererSize);
        let centralizedViewPos = rendererCenter.subtract(this._viewBounds.width / 2.0, this.viewBounds.height / 2.0).negate();
        this.viewPosition = centralizedViewPos;
    }

    public resetView() {
        let viewPos = this.viewPosition;
        let extraHorizontalSpacing = Settings.gridWidth * panOutOfGridHorizontalSpacingFactor;
        let extraVerticalSpacing = Settings.gridHeight * panOutOfGridVerticalSpacingFactor;

        // calculate centralized view if it's smaller than renderer wrapper size
        let rendererCenter = Point.fromSize(Settings.halfRendererSize);
        let centralizedViewPos = rendererCenter.subtract(this._viewBounds.width / 2.0, this.viewBounds.height / 2.0).negate();

        // horizontal
        if (this._viewBounds.width + 2 * extraHorizontalSpacing < Settings.rendererWidth) {
            viewPos.x = centralizedViewPos.x;
        } else {
            viewPos.x = -extraHorizontalSpacing;
        }

        // vertical
        if (this._viewBounds.height + 2 * extraVerticalSpacing < Settings.rendererHeight) {
            viewPos.y = centralizedViewPos.y;
        } else {
            viewPos.y = (Settings.gridHeight + 2 * extraVerticalSpacing) - Settings.rendererHeight - extraVerticalSpacing;
        }

        this.viewPosition = viewPos;
    }

    protected start() {
        this._statusBarElements.set('mousePos', document.getElementById('mouse-pos'));
        this._statusBarElements.set('mouseGridPos', document.getElementById('mouse-grid-pos'));
        this._statusBarElements.set('zoom', document.getElementById('zoom'));
        this._statusBarElements.set('targetMode', document.getElementById('target-mode'));

        // pan
        this.viewBounds = new PIXI.Rectangle(0, 0, Settings.rendererWidth, Settings.rendererHeight);
        Input.mouseButton(MouseButtons.Secondary)
                .addListener('pressed', function() {
                    this._pointerAnchorPos = Input.pointerGlobalPos;
                }, this)
                .addListener('down', function() {
                    let viewPos = this.viewPosition;
                    let extraHorizontalSpacing = Settings.gridWidth * panOutOfGridHorizontalSpacingFactor;
                    let extraVerticalSpacing = Settings.gridHeight * panOutOfGridVerticalSpacingFactor;

                    // calculate centralized view if it's smaller than renderer wrapper size
                    let rendererCenter = Point.fromSize(Settings.halfRendererSize);
                    let centralizedViewPos = rendererCenter.subtract(this._viewBounds.width / 2.0, this.viewBounds.height / 2.0).negate();

                    // calculate mouse pan movement
                    let screenCenter = Point.fromSize(Settings.halfRendererSize);
                    let panMovement = Point.subtract(Input.pointerGlobalPos, this._pointerAnchorPos).divide(screenCenter).multiply(panMaxSpeed * this.zoom);
                    let afterPanViewPos = Point.add(viewPos, panMovement);

                    // horizontal
                    if (this._viewBounds.width * this.zoom + 2 * extraHorizontalSpacing < Settings.rendererWidth) {
                        viewPos.x = centralizedViewPos.x;
                    } else {
                        viewPos.x = clamp(afterPanViewPos.x, -extraHorizontalSpacing, (Settings.gridWidth * this.zoom + 2 * extraHorizontalSpacing) - Settings.rendererWidth - extraHorizontalSpacing);
                    }

                    // vertical
                    if (this._viewBounds.height * this.zoom + 2 * extraVerticalSpacing < Settings.rendererHeight) {
                        viewPos.y = centralizedViewPos.y;
                    } else {
                        viewPos.y = clamp(afterPanViewPos.y, -extraVerticalSpacing, (Settings.gridHeight * this.zoom + 2 * extraVerticalSpacing) - Settings.rendererHeight - extraVerticalSpacing);
                    }

                    this.viewPosition = viewPos;
                }, this);

        // switch target mode
        Input.keyboardButton(Key.Tab)
                .addListener('pressed', function() {
                    switch (Settings.targetMode) {
                        case TargetMode.Pixel:
                            Settings.targetMode = TargetMode.Tile;
                            break;

                        case TargetMode.Tile:
                            Settings.targetMode = TargetMode.Pixel;
                            break;

                        default:
                            break;
                    }
                }, this)

        this.debugText = new PIXI.Text('Debug', { fontFamily: 'Arial', fontSize: 12, fill: 0xff00ff, align: 'center' });
        this._app.stage.addChild(this.debugText);
    }

    protected beforeUpdate(): void {
        Input.update(this.lastUpdateDelta);
    }

    protected update(delta: number): void {
        //this.debugText.text = `MousePos: ${Input.pointerPos} | ViewPos: ${this.viewPosition.divide(Settings.currentZoomFactor)} | Grid Cell: ${Input.pointerGridCell}`;
        this.toolbar.update(delta);

        // zoom
        if (Input.wheelDelta !== 0) {
            let inc = zoomIncFactor * Math.sign(Input.wheelDelta);
            let previousZoom = this.zoom;
            let nextZoom = clamp(this.zoom + inc, zoomMin, zoomMax);
            this.viewPosition = this.viewPosition.add(Point.multiply(Input.pointerPos, (nextZoom / previousZoom) - 1.0));
            this.zoom = nextZoom;
        }
    }

    protected lateUpdate(): void {
        Input.lateUpdate();
        let pointerPos = Input.pointerPos;
        let pointerGridCell = Input.pointerGridCell;

        let targetMode: string = 'None';

        switch (Settings.targetMode) {
            case TargetMode.Pixel:
                targetMode = 'Pixel';
                break;

            case TargetMode.Tile:
                targetMode = 'Tile';
                break;

            default:
                break;
        }

        this._statusBarElements.get('targetMode').textContent = targetMode;
        this._statusBarElements.get('mousePos').textContent = `${pointerPos.x.toFixed(0)}, ${pointerPos.y.toFixed(0)}`;
        this._statusBarElements.get('mouseGridPos').textContent = `[${pointerGridCell.x}, ${pointerGridCell.y}]`;
        this._statusBarElements.get('zoom').textContent = `${(this.zoom * 100.0).toFixed(0)}%`;
    }

    protected render(): void {
        if (!this._isReady) {
            return;
        }

        Draw.clear();
        this.gridContainer.setTransform(-this._viewBounds.x, -this._viewBounds.y, this.zoom, this.zoom);
        this.toolbar.render(this.surface);
        Draw.lineStyle(0xCAEBFD);
        Draw.grid(this.bounds, Settings.gridCellSize);
    }
}

let options = {
    //transparent: true,
    antialias: false,
    backgroundColor: 0xfffff1,
    roundPixels: true
};

let renderer: Renderer;
renderer = new Renderer(options);

// messages
ipcRenderer.on('setup', (event, columns, rows, size) => {
    renderer.setupGrid(columns, rows, size);
});

ipcRenderer.send('request-setup');
