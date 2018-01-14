
export default abstract class Graphic {
    public displayObject: PIXI.DisplayObject;

    constructor(displayObject: PIXI.DisplayObject) {
        this.displayObject = displayObject;
    }
}
