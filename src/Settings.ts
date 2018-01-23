export default class Settings {
    public static renderWrapper: HTMLElement;
    public static rendererSize: Size = { width: 0, height: 0 };
    public static gridSize: Size = { width: 0, height: 0 };
    public static gridCellSize: Size = { width: 0, height: 0 };
    public static currentZoomFactor = 1.0;
    public static clearColor = 0xfffff1;

    public static get rendererWidth(): number {
        return Settings.rendererSize.width;
    }

    public static get rendererHeight(): number {
        return Settings.rendererSize.height;
    }

    public static get halfRendererSize(): Size {
        return { width: Settings.rendererWidth / 2.0, height: Settings.rendererHeight / 2.0 };
    }

    public static get gridWidth(): number {
        return Settings.gridSize.width;
    }

    public static get gridHeight(): number {
        return Settings.gridSize.height;
    }
}
