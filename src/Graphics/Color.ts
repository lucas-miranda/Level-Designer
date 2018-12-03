import { clamp } from '../Util/Helper';

export default class Color {
    static readonly White: Color = new Color(0xFFFFFF);

    private rgb: number;

    constructor(color: number) {
        this.rgb = color;
    }

    public get R(): number {
        return this.rgb >> 16;
    }

    public set R(r: number) {
        r = clamp(r, 0, 255);
        let oldR = this.rgb >> 16;
        this.rgb = (this.rgb & ~(oldR << 16)) | (r << 16);
    }

    public get G(): number {
        let r = this.R << 8;
        return (this.rgb >> 8) & ~r;
    }

    public set G(g: number) {
        g = clamp(g, 0, 255);
        let oldG = (this.rgb >> 8) & ~(this.R << 8);
        this.rgb = (this.rgb & ~(oldG << 8)) | (g << 8);
    }

    public get B(): number {
        let rg = (this.rgb >> 8) << 8;
        return (this.rgb >> 8) & ~rg;
    }

    public set B(b: number) {
        b = clamp(b, 0, 255);
        let rg = (this.rgb >> 8) << 8;
        let oldB = this.rgb & ~rg;
        this.rgb = (this.rgb & ~oldB) | b;
    }

    public get RGB(): number {
        return this.rgb;
    }

    public set RGB(rgb: number) {
        this.rgb = rgb;
    }

    public static fromRGB(r: number, g: number, b: number) {
        let rgb = (r << 16) | (g << 8) | b;
        return new Color(rgb);
    }

    public static lighten(color: Color, amount: number) {
        let diff = Color.White.subtract(color);
        diff = diff.multiply(amount);
        return color.add(diff);
    }

    public static darken(color: Color, amount: number) {
        amount = 1 - clamp(amount, 0, 1);
        return color.multiply(amount);
    }

    public add(color: Color) {
        return Color.fromRGB(
            clamp(this.R + color.R, 0, 255),
            clamp(this.G + color.G, 0, 255),
            clamp(this.B + color.B, 0, 255)
        );
    }

    public subtract(color: Color) {
        return Color.fromRGB(
            clamp(this.R - color.R, 0, 255),
            clamp(this.G - color.G, 0, 255),
            clamp(this.B - color.B, 0, 255)
        );
    }

    public multiply(value: number) {
        return Color.fromRGB(
            clamp(this.R * value, 0, 255),
            clamp(this.G * value, 0, 255),
            clamp(this.B * value, 0, 255)
        );
    }
}
