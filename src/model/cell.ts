import Observable from "./observable";
import Grid from "./grid";
import {PredictionRange} from "./predictionRange";

export type CellState = "normal" | "source" | "target" | "wall";
export default class Cell extends Observable {
    protected elevation: number;
    protected state: CellState;
    protected index: {x: number; y: number};
    protected inPath = false;
    protected inFrontier = false;
    protected score: number;
    protected grid: Grid;

    protected predictionRange: PredictionRange;
    protected predictionRangeListener: () => any;

    constructor(index: {x: number; y: number}, grid: Grid) {
        super();
        this.grid = grid;
        this.elevation = 1;
        this.score = -1;
        this.state = "normal";
        this.index = index;
        this.predictionRangeListener = () => {
            if (this.score != -1) this.notify();
        };
    }

    // Get a reference to the grid
    getGrid(): Grid {
        return this.grid;
    }

    // Get ID
    getID(): string {
        return this.index.x + "-" + this.index.y;
    }
    getIndex(): {x: number; y: number} {
        return this.index;
    }

    // Set type
    setNormal(): void {
        this.setState("normal");
    }
    setSource(): void {
        this.setState("source");
    }
    setTarget(): void {
        this.setState("target");
    }
    setPath(val: boolean): void {
        this.inPath = val;
        this.notify();
    }
    setFrontier(val: boolean): void {
        this.inFrontier = val;
        this.notify();
    }
    setWall(): void {
        this.setState("wall");
    }
    setState(type: CellState): void {
        this.state = type;
        this.notify();
    }

    // Get type
    isNormal(): boolean {
        return this.state == "normal";
    }
    isSource(): boolean {
        return this.state == "source";
    }
    isTarget(): boolean {
        return this.state == "target";
    }
    isPath(): boolean {
        return this.inPath;
    }
    isFrontier(): boolean {
        return this.inFrontier;
    }
    isWall(): boolean {
        return this.state == "wall";
    }
    getState(): string {
        return this.state;
    }

    // Set values
    setScore(score: number): void {
        this.score = score;
        this.notify();
    }
    setPredictionRange(predictionRange: PredictionRange): void {
        if (this.predictionRange) this.predictionRange.removeListener(this.predictionRangeListener);
        this.predictionRange = predictionRange;
        if (this.predictionRange) this.predictionRange.addListener(this.predictionRangeListener);
    }
    setElevation(elevation: number): void {
        this.elevation = Math.max(Math.min(this.getMaxPathCost(), elevation), 1);
        this.notify();
    }

    // Get values
    getScore(): number {
        return this.score;
    }
    getNormalisedScore(): number {
        if (this.predictionRange) {
            const min = this.predictionRange.getMinScore();
            const max = this.predictionRange.getMaxScore();
            // console.log(min, max);
            return (this.score - min + 1) / (max - min + 1);
        }
        return 0;
    }
    getPathCost(raw?: boolean): number {
        return this.isWall() && !raw ? Infinity : this.elevation;
    }
    getElevation(): number {
        return this.elevation;
    }
    getMaxPathCost() {
        return 40;
    }

    // Cell retrieval
    getNeighbour(deltaX: number, deltaY: number): Cell {
        return this.grid.getCell(deltaX + this.index.x, deltaY + this.index.y);
    }
    getNeighbours(includeIndirect: boolean): Cell[] | {cell: Cell; isDiagonal: boolean}[] {
        if (includeIndirect) {
            return [
                [0, -1],
                [1, 0],
                [0, 1],
                [-1, 0],
                [1, -1],
                [1, 1],
                [-1, 1],
                [-1, -1],
            ]
                .map(delta => ({
                    cell: this.getNeighbour(delta[0], delta[1]),
                    isDiagonal: delta[0] != 0 && delta[1] != 0,
                }))
                .filter(cell => cell.cell != null);
        } else {
            return [
                [0, -1],
                [1, 0],
                [0, 1],
                [-1, 0],
            ]
                .map(delta => this.getNeighbour(delta[0], delta[1]))
                .filter(cell => cell != null);
        }
    }
    getNonWallNeighbours(includeIndirect: boolean): Cell[] | {cell: Cell; isDiagonal: boolean}[] {
        let c;
        if (includeIndirect) {
            return [
                [0, -1],
                [1, 0],
                [0, 1],
                [-1, 0],
                [1, -1],
                [1, 1],
                [-1, 1],
                [-1, -1],
            ]
                .map(delta => ({
                    cell: this.getNeighbour(delta[0], delta[1]),
                    delta: delta,
                    isDiagonal: delta[0] != 0 && delta[1] != 0,
                }))
                .filter(
                    cell =>
                        cell.cell != null &&
                        !cell.cell.isWall() &&
                        (!cell.isDiagonal ||
                            (!((c = this.getNeighbour(cell.delta[0], 0)) && c.isWall()) &&
                                !((c = this.getNeighbour(0, cell.delta[1])) && c.isWall())))
                );
        } else {
            const out: Cell[] = [];
            let n = this.getNeighbour(0, -1);
            if (n && !n.isWall()) out.push(n);
            n = this.getNeighbour(1, 0);
            if (n && !n.isWall()) out.push(n);
            n = this.getNeighbour(0, 1);
            if (n && !n.isWall()) out.push(n);
            n = this.getNeighbour(-1, 0);
            if (n && !n.isWall()) out.push(n);
            return out;
            // return [[0, -1], [1, 0], [0, 1], [-1, 0]]
            //     .map(delta => this.getNeighbour(delta[0], delta[1]))
            //     .filter(cell => cell != null && !cell.isWall());
        }
    }

    // Cell data
    getGridDistance(cell: Cell): number {
        const deltaX = cell.index.x - this.index.x;
        const deltaY = cell.index.y - this.index.y;
        return Math.abs(deltaY) + Math.abs(deltaX);
    }
    getLineDistance(cell: Cell): number {
        const deltaX = cell.index.x - this.index.x;
        const deltaY = cell.index.y - this.index.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
}
