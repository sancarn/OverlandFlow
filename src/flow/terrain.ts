import {SimplexNoise} from "./noise";
import Grid from "../model/grid";

export class Random {
    protected seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    random(): number {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

export const initializeTerrain = (grid: Grid, seed: number = 15, scale: number = 25) => {
    let noise = new SimplexNoise(new Random(seed));

    const width = grid.getWidth();
    const height = grid.getHeight();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const elevation = noise.noise((x - width / 2) / scale, (y - height / 2) / scale);
            grid.getCell(x, y).setElevation(20 * (1 + elevation));
        }
    }
};
