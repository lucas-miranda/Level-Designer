import { join } from './Util/Helper';
import Settings from './Settings';
import { Event, EventEmitter } from './Event';
import Point from './Math/Point';

export enum MouseButtons {
    Main = 0,
    Auxiliary,
    Secondary,
    Fourth,
    Fifth
}

export enum Key {
    D0 = 48, D1, D2, D3, D4, D5, D6, D7, D8, D9,
    A = 65, B, C, D, E, F, G, H, I, J, K, L, M,
    N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
    Numpad0 = 96, Numpad1, Numpad2, Numpad3, Numpad4,
    Numpad5, Numpad6, Numpad7, Numpad8, Numpad9,
    Multiply = 106, Add,
    Subtract = 109, Decimal, Divide,
    F1 = 112, F2, F3, F4, F5, F6, F7, F8, F9, F10,
    F11, F12, F13, F14, F15,
    Backspace = 8, Tab,
    Enter = 13,
    Shift = 16,
    Control = 17,
    CapsLock = 20,
    Esc = 27,
    Spacebar = 32, PageUp, PageDown, End, Home,
    LeftArrow, UpArrow, RightArrow, DownArrow,
    Insert = 45, Delete,
    NumLock = 144, ScrollLock,
    PauseBreak = 19,
    Semicolon = 186, Plus, Comma, Minus, Period, Question, Tilde,
    OpenBrackets = 219, Pipe, CloseBrackets, Quotes
}

export default class Input {
    private static _mouseButtons: EventEmitter<MouseButtons, MouseButton>;
    private static _keyboardKeys: EventEmitter<Key, KeyboardButton>;
    public static manager: PIXI.interaction.InteractionManager;
    public static pointerLastPos: Point;
    public static pointerMovement: Point = new Point();
    public static wheelDelta: number = 0;
    public static cameraContainer: PIXI.Container;

    public static get pointerGlobalPos(): Point {
        return Point.fromPoint(Input.manager.mouse.global);
    }

    public static get pointerPos(): Point {
        let viewPos = Point.fromPoint(Input.cameraContainer.position).divide(Settings.currentZoomFactor);
        return Point.clamp(Point.subtract(Input.pointerGlobalPos.divide(Settings.currentZoomFactor), viewPos), Point.ZERO, Point.fromSize(Settings.gridSize));
    }

    /*public static get pointerScreenPos(): Point {
        let viewPos = Point.fromPoint(Input.cameraContainer.position).divide(Settings.currentZoomFactor);
        return Point.clamp(Point.subtract(Input.pointerGlobalPos, viewPos), Point.ZERO, Point.fromSize(Settings.gridSize));
    }*/

    public static get pointerGridCell(): Point {
        let pointerPos = Input.pointerPos;
        return new Point(Math.floor(pointerPos.x / Settings.gridCellSize.width), Math.floor(pointerPos.y / Settings.gridCellSize.height));
    }

    public static start(manager: PIXI.interaction.InteractionManager, cameraContainer: PIXI.Container): void {
        Input.manager = manager;
        Input.manager.moveWhenInside = true;
        Input.cameraContainer = cameraContainer;
        Input.pointerLastPos = Input.pointerPos;

        // register events

        // mouse
        Input._mouseButtons = new EventEmitter<MouseButtons, MouseButton>();
        Input.manager.addListener('pointerdown', Input.onPointerPressed)
                     .addListener('pointerup', Input.onPointerReleased)
                     .addListener('pointerupoutside', Input.onPointerReleased)
                     .addListener('pointercancel', Input.onPointerReleased);
        window.addEventListener('wheel', Input.onMouseWheel);

        // keyboard
        Input._keyboardKeys = new EventEmitter<Key, KeyboardButton>();
        window.addEventListener('keydown', Input.onKeyDown, false);
        window.addEventListener('keyup', Input.onKeyReleased, false);
    }

    public static update(delta: number): void {
        Input.pointerMovement = new Point(Input.pointerPos.x - Input.pointerLastPos.x, Input.pointerPos.y - Input.pointerLastPos.y)

        for (let mouseButton of Input._mouseButtons) {
            mouseButton[1].update(delta);
        }

        for (let keyboardKey of Input._keyboardKeys) {
            keyboardKey[1].update(delta);
        }
    }

    public static lateUpdate(): void {
        Input.pointerLastPos = Input.pointerPos;
        Input.wheelDelta = 0;
    }

    public static mouseButton(mouseButton: MouseButtons): MouseButton {
        if (!Input._mouseButtons.has(mouseButton)) {
            Input._mouseButtons.set(mouseButton, new MouseButton(mouseButton));
        }

        return Input._mouseButtons.get(mouseButton);
    }

    public static keyboardButton(key: Key): KeyboardButton {
        if (!Input._keyboardKeys.has(key)) {
            Input._keyboardKeys.set(key, new KeyboardButton(key));
        }

        return Input._keyboardKeys.get(key);
    }

    public static fireMouseButtonEvent(eventName: string, mouseButton: MouseButtons): MouseButton {
        return this._mouseButtons.fire(eventName, mouseButton);
    }

    public static fireKeyboardButtonEvent(eventName: string, key: Key): KeyboardButton {
        return this._keyboardKeys.fire(eventName, key);
    }

    private static onPointerPressed(event: PIXI.interaction.InteractionEvent): void {
        let button = Input.fireMouseButtonEvent('pressed', event.data.button as MouseButtons);

        if (button === undefined) {
            return;
        }

        button.isDown = true;
    }

    private static onPointerReleased(event: PIXI.interaction.InteractionEvent): void {
        let button = Input.fireMouseButtonEvent('released', event.data.button as MouseButtons);

        if (button === undefined) {
            return;
        }

        button.isUp = true;
    }

    private static onMouseWheel(event: WheelEvent): void {
        Input.wheelDelta = event.wheelDelta;
    }

    private static onKeyDown(event: KeyboardEvent): void {
        let key = event.keyCode as Key;
        if (!Input._keyboardKeys.has(key)) {
            return;
        }

        let button = Input._keyboardKeys.get(key);
        if (button.isUp) {
            Input.fireKeyboardButtonEvent('pressed', key);
            button.isDown = true;
        }

        Input.fireKeyboardButtonEvent('down', key);
    }

    private static onKeyReleased(event: KeyboardEvent): void {
        let button = Input.fireKeyboardButtonEvent('released', event.keyCode as Key);

        if (button === undefined) {
            return;
        }

        button.isUp = true;
    }
}

export class Button extends Event {
    public static eventNames = [ 'pressed', 'released', 'down', 'up' ];
    public isDown: boolean = false;

    constructor() {
        super(...Button.eventNames);
    }

    public get isUp(): boolean {
        return !this.isDown;
    }

    public set isUp(up: boolean) {
        this.isDown = !up;
    }

    public update(delta: number) {
        super.update(delta);
        if (this.isDown) {
            this.fire('down');
        } else {
            this.fire('up');
        }
    }
}

export class MouseButton extends Button {
    public identifier: MouseButtons;

    constructor(identifier: MouseButtons) {
        super();
        this.identifier = identifier;
    }
}

export class KeyboardButton extends Button {
    public identifier: Key;

    constructor(identifier: Key) {
        super();
        this.identifier = identifier;
    }
}
