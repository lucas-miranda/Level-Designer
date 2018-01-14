export default class Settings {
    public static renderWrapper: HTMLElement;
    public static size: Size;

    public static get width(): number {
        return Settings.size.width;
    }

    public static get height(): number {
        return Settings.size.height;
    }
}
