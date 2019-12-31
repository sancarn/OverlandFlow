import Cell from "./cell";
import Observable from "./observable";

export default class Grid extends Observable {
    protected size: {width: number; height: number};
    protected cells: Cell[][];
    protected source: Cell = null;

    constructor(size: {width: number; height: number}) {
        super();
        this.size = size;

        // Generate a cells array of the given size
        this.cells = [];
        for (let y = 0; y < size.height; y++) {
            const row = [];
            for (let x = 0; x < size.width; x++) {
                const cell = new Cell({x: x, y: y}, this);
                cell.addListener(this.onCellUpdate.bind(this));
                row.push(cell);
            }
            this.cells.push(row);
        }
    }

    // Makes sure there can only be 1 source
    protected onCellUpdate(cell: Cell) {
        if (this.source != cell && cell.isSource()) {
            if (this.source) this.source.setNormal();
            this.source = cell;
        }
        if (this.source == cell && !cell.isSource()) this.source = null;
    }

    // Standard methods
    getWidth() {
        return this.size.width;
    }
    getHeight() {
        return this.size.height;
    }

    getCells(): Cell[][] {
        return this.cells;
    }
    getCell(x: number, y: number) {
        if (x >= this.size.width || y >= this.size.height || x < 0 || y < 0) return undefined;
        return this.cells[y][x];
    }

    forEach(callback: (cell: Cell) => void): void {
        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {
                callback(this.cells[y][x]);
            }
        }
    }

    // Get specific cells
    getSource(): Cell {
        return this.source;
    }
    getTargets(): Cell[] {
        const targets = [];
        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {
                const cell = this.cells[y][x];
                if (cell.isTarget()) targets.push(cell);
            }
        }
        return targets;
    }

    // Set path
    setPath(cells: Cell[]): void {
        cells.forEach(cell => cell.setPath(true));
    }
    resetPaths(): void {
        this.forEach(cell => cell.setPath(false));
    }

    // Resets
    resetScores(): void {
        this.forEach(cell => cell.setScore(-1));
    }
    resetFontier(): void {
        this.forEach(cell => cell.setFrontier(false));
    }
}
