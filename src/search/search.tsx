import {Button, FormLabel, Switch, FormControlLabel} from "@material-ui/core";
import {Slider} from "material-ui-slider";
import React from "react";

import {PlayArrow as PlayIcon, Stop as StopIcon} from "@material-ui/icons";

import "../styling/search.css";
import Grid from "../model/grid";
import Cell from "../model/cell";
import Heap from "./heap";
import Observable from "../model/observable";
import {PredictionRange} from "../model/predictionRange";

type Path = {
    cell: Cell;
    cost: number; // The cost to reach this cell
    score: number; // The estimated distance (cost + distance left) to reach the goal
    parent: Path;
};

const sqrt2 = Math.sqrt(2);
const maxInterval = 30;
export default class Searcher extends React.Component<
    {grid: Grid},
    {
        searching: boolean;
        intervalTime: number;
        gridDistance: boolean;
        heuristicWeight: number;
        allowDiagonal: boolean;
    }
> {
    protected source: Cell;
    protected targets: Cell[];

    protected visited: {[ID: string]: {[ID: string]: true}}; // keep track of visited cells (from a certain side)
    protected frontier: Heap<Path>;

    protected searching: boolean = false;
    protected interval: number;
    protected prevTime: number;

    protected predictionRange: PredictionRange = new PredictionRange();

    constructor(props) {
        super(props);
        this.state = {
            searching: false,
            intervalTime: 20,
            gridDistance: false,
            heuristicWeight: 1,
            allowDiagonal: true,
        };
        props.grid.forEach(cell => cell.setPredictionRange(this.predictionRange));
    }

    // Misc
    reset() {
        if (this.state.searching) this.endSearch(null);
        const grid = this.props.grid;
        grid.resetPaths();
        grid.resetScores();
        grid.resetFontier();
        this.predictionRange.setMinScore(Infinity);
        this.predictionRange.setMaxScore(-Infinity);
    }

    // Search start/stop methods
    search(): void {
        const grid = this.props.grid;
        if (!this.state.searching) {
            this.source = grid.getSource();
            if (!this.source) return;

            this.searching = true;
            this.setState({searching: true});
            this.reset();

            // Initialise variables
            this.targets = grid.getTargets();
            this.frontier = new Heap<Path>((a, b) => a.score < b.score);
            this.visited = {};

            this.addToFrontier(this.source, null, false);

            // Start the interval
            this.startInterval();
            console.log("search started");
        }
    }
    protected startInterval(): void {
        if (this.state.intervalTime == 0) {
            while (this.searching) this.searchStep();
        } else {
            this.prevTime = Date.now();
            // Small startup delay
            setTimeout(() => {
                clearInterval(this.interval);
                this.interval = setInterval(() => {
                    // Get the delta
                    const time = Date.now();
                    const delta = time - this.prevTime;
                    this.prevTime = time;

                    // Check if delta contains multiple steps
                    const steps = Math.floor(delta / this.state.intervalTime);
                    for (let i = 0; i < steps && this.searching; i++) this.searchStep();
                }, this.state.intervalTime);
            }, 5000);
        }
    }
    protected endSearch(path: Path): void {
        // Stop the search
        this.setState({searching: false});
        this.searching = false;
        clearInterval(this.interval);

        // Do something with the result
        const cells = [];
        while (path) {
            cells.push(path.cell);
            path = path.parent;
        }
        cells.pop();
        cells.shift();

        const grid = this.props.grid;
        grid.setPath(cells);

        // Update the prediction range
        setTimeout(() => {
            // Prediction range allows fo easily updating while computing, but decided to not use due to performance consideration
            grid.forEach(cell => {
                if (cell.getScore() > -1 && cell.getScore() < this.predictionRange.getMinScore())
                    this.predictionRange.setMinScore(cell.getScore());
            });
            grid.forEach(cell => {
                if (cell.getScore() > this.predictionRange.getMaxScore())
                    this.predictionRange.setMaxScore(cell.getScore());
            });
            this.predictionRange.releaseBulk();
        });
        console.log("search finished");
    }

    // Search methods
    protected searchStep(): void {
        if (!this.searching) return;

        // Get the the cell from the frontier with the smallest distance to goal
        const path = this.frontier && this.frontier.extract();
        if (!path) return this.endSearch(null);
        path.cell.setFrontier(false);

        // Go through all children, and add them to the frontier
        if (this.state.allowDiagonal) {
            const children = path.cell.getNonWallNeighbours(true);
            children.forEach(child => this.addToFrontier(child.cell, path, child.isDiagonal));
        } else {
            const children = path.cell.getNonWallNeighbours(false);
            children.forEach(child => this.addToFrontier(child, path, false));
        }
    }
    protected addToFrontier(cell: Cell, parent: Path, isDiagonal: boolean): void {
        // Check if this cell hasn't been in the frontier already
        let v = this.visited[cell.getID()];
        if (!v) v = this.visited[cell.getID()] = {};
        if (parent) {
            // Return if we already visited through this parent
            if (v[parent.cell.getID()]) return;

            // Track that we visited the cell through this parent (and prevent going back)
            v[parent.cell.getID()] = true;
            this.visited[parent.cell.getID()][cell.getID()] = true;
        }

        // Add to the frontier if it is
        const cost = cell.getElevation();
        const dist = this.getDistance(cell);
        const score = cost + this.state.heuristicWeight * dist;
        const path = {
            cell: cell,
            cost: cost,
            score: score,
            parent: parent,
        };
        if (dist == 0) this.endSearch(path);
        else {
            if (score < cell.getScore() || cell.getScore() == -1) {
                this.frontier.insert(path);
                cell.setFrontier(true);
                cell.setScore(score);
            }
        }
    }
    protected getDistance(cell: Cell): number {
        return this.targets.reduce(
            (a, target) =>
                Math.min(
                    a,
                    (this.state.gridDistance
                        ? cell.getGridDistance(target)
                        : cell.getLineDistance(target)) == 0
                        ? 0
                        : 1
                ),
            1
        );
        // return this.targets.reduce(
        //     (a, target) =>
        //         Math.min(
        //             a,
        //             this.state.gridDistance
        //                 ? cell.getGridDistance(target)
        //                 : cell.getLineDistance(target)
        //         ),
        //     Infinity
        // );
    }

    // Rendering
    render() {
        return (
            <div className="search">
                <div>
                    <Button onClick={() => this.search()} variant="contained" color="primary">
                        <PlayIcon />
                    </Button>
                    <Button onClick={() => this.reset()} variant="contained" color="primary">
                        <StopIcon />
                    </Button>
                </div>
                <div>
                    <div className="speed">
                        <Slider
                            className="slider"
                            min={0}
                            max={maxInterval}
                            value={maxInterval - this.state.intervalTime}
                            onChange={value => this.setIntervalTime(maxInterval - value)}
                        />

                        <FormLabel>Speed</FormLabel>
                    </div>
                </div>
                <br style={{clear: "both"}} />
            </div>
        );
    }
    protected setIntervalTime(time: number): void {
        this.setState({intervalTime: time});
        clearInterval(this.interval);
        if (this.state.searching) this.startInterval();
    }
}
