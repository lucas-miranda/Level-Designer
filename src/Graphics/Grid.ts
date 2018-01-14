/*import Graphic from './Graphic';

export default class Grid extends Graphic {
    public columns: number;
    public rows: number;
    public cellSize: Size;
    public color: number;

    static render(context: RenderContext, viewport: Phaser.Rectangle, cellSize: Size, color: number) {
        context.setLineOptions(color);

        var columns = viewport.width / cellSize.width;
        var rows = viewport.height / cellSize.height;

        for (var column = 0; column <= columns; column++) {
            //context.drawRectangle(viewport.left + column * cellSize.width, viewport.top, 1, viewport.height);
            let x = viewport.left + column * cellSize.width;
            context.drawLine(x, viewport.top, x, viewport.bottom);
        }

        for (var row = 0; row <= rows; row++) {
            //context.drawRectangle(viewport.left, viewport.top + row * cellSize.height, viewport.width, 1);
            let y = viewport.top + row * cellSize.height;
            context.drawLine(viewport.left, y, viewport.right, y);
        }

        /*graphics.lineWidth = 1.5;
        graphics.lineColor = color;

        if (viewport.top < 0) {
            graphics.drawRect(viewport.left + (columns / 2) * cellSize.width, viewport.top, 1, viewport.height);
        }

        if (viewport.left < 0) {
            graphics.drawRect(viewport.left, viewport.top + (rows / 2) * cellSize.height, viewport.width, 1);
        }

        graphics.endFill();
    }

    public setup(game: Phaser.Game, graphics: Phaser.Graphics, columns: number, rows: number, cellSize: Size) {
        this.destroy();
        this.columns = columns;
        this.rows = rows;
        this.cellSize = cellSize;

        graphics.clear();
        graphics.beginFill(this.color, 1);

        for (var column = 0; column <= columns; column++) {
            graphics.drawRect(column * cellSize.width, 0, 1, rows * cellSize.height);
        }

        for (var row = 0; row <= rows; row++) {
            graphics.drawRect(0, row * cellSize.height, columns * cellSize.width, 1);
        }

        graphics.endFill();

        this.texture = graphics.generateTexture();
        this.image = new Phaser.Image(game, 0, 0, this.texture);
        game.add.existing(this.image);
    }*/
