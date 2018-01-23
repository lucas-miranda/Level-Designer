import { Renderer } from './Renderer';
import Graphic from './Graphics/Graphic';
import Settings from './Settings';

export default class Surface {
    private _renderer: PIXI.WebGLRenderer;
    private _renderTexture: PIXI.RenderTexture;
    private _renderSprite: PIXI.Sprite;

    constructor(renderer: PIXI.WebGLRenderer, width: number, height: number) {
        this._renderer = renderer;

        this._renderTexture = PIXI.RenderTexture.create(width, height, PIXI.SCALE_MODES.NEAREST);

        this._renderSprite = new PIXI.Sprite(this._renderTexture);

        this._renderer.clearRenderTexture(this._renderTexture, Settings.clearColor);
    }

    public get renderTextuer(): PIXI.RenderTexture {
        return this._renderTexture;
    }

    public get sprite(): PIXI.Sprite {
        return this._renderSprite;
    }

    public get width(): number {
        return this._renderSprite.width;
    }

    public get height(): number {
        return this._renderSprite.height;
    }

    public setup(width: number, height: number) {
        this._renderTexture.resize(width, height);
    }

    public draw(graphic: PIXI.DisplayObject | Graphic, clear?: boolean) {
        let displayObject: PIXI.DisplayObject;
        if (graphic instanceof Graphic) {
            displayObject = (graphic as Graphic).displayObject;
        } else {
            displayObject = graphic as PIXI.DisplayObject;
        }

        this._renderer.render(displayObject, this._renderTexture, clear || false);
    }
}
