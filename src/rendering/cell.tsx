import "../styling/cell.css";
import React from "react";
import Cell, {CellState} from "../model/cell";

export default class CellComponent extends React.PureComponent<
    {cell: Cell; searchRender: boolean},
    {}
> {
    // A global mousedown variable to track if you are dragging
    public static dragData: {
        state: CellState;
        pathCost: number;
    };
    public static dragged = false;

    componentDidMount() {
        const cell = this.props.cell;
        // Make sure to refresh when cell data changes
        cell.addListener(this.forceUpdate.bind(this, null));
    }

    scroll(event) {
        const cell = this.props.cell;
        cell.setElevation(cell.getPathCost() - (event.deltaY > 0 ? 1 : -1));
    }
    leftDown(event) {
        event.preventDefault();
        CellComponent.dragged = false;
        const cell = this.props.cell;

        // Get the data to drag around
        CellComponent.dragData = {
            state: cell.getState() as any,
            pathCost: cell.getPathCost(true),
        };
    }
    leftRelease(event) {
        // Only change if not dragged
        if (!CellComponent.dragged) {
            const cell = this.props.cell;
            const state = cell.getState();

            if (event.button == 0) {
                const states = ["normal", "source", "target"];
                if (cell.getGrid().getSource() != null) states.splice(1, 1); // Only allow placing source if none is present yet
                const newIndex = (states.indexOf(state) + 1) % states.length;
                const newState = states[newIndex];
                cell.setState(newState as any);
                cell.setElevation(1);
            } else {
                if (cell.isNormal() && cell.getPathCost() == 1) {
                    cell.setWall();
                } else {
                    cell.setElevation(0);
                    cell.setNormal();
                }
            }
        }
    }
    enter() {
        // Drag the state around
        CellComponent.dragged = true;
        if (CellComponent.dragData) {
            const cell = this.props.cell;
            const d = CellComponent.dragData;
            cell.setState(d.state);
            cell.setElevation(d.pathCost);
        }
    }

    render() {
        const cell = this.props.cell;
        const searchRender = this.props.searchRender; // Whether to render search data

        // Get the state to display
        let state = cell.isPath() ? "path" : cell.getState();
        if (cell.isNormal() && cell.isFrontier() && searchRender) state = "frontier";

        // Change the color based on traverse cost
        const pathCostPer = (cell.getPathCost() - 1) / cell.getMaxPathCost();
        let i = Math.floor(pathCostPer * 255);
        let color =
            state == "normal" ? `rgb(${Math.floor(i * 0.5)}, ${i}, ${Math.floor(i * 0.5)})` : ""; //`rgb(${i}, ${i}, ${i})` : "";

        // // Change the color based on search score
        // i = 255 - Math.floor(cell.getNormalisedScore() * 150);
        // if (cell.getScore() != -1 && state == "normal") color = `rgb(${i}, ${i}, 255)`;

        // Display the search score
        const text = cell.getScore() >= 0 && searchRender ? Math.floor(cell.getScore()) : "";
        const text2 =
            cell.getScore() >= 0 && searchRender ? Math.floor(cell.getScore() * 100) / 100 : "";

        // Rendere the cell
        return (
            <span
                onWheel={this.scroll.bind(this)} // Change the path cost
                onMouseDown={this.leftDown.bind(this)} // Get state to drag
                onMouseUp={this.leftRelease.bind(this)} // Change state
                onMouseEnter={this.enter.bind(this)} // Drag change state
                onContextMenu={event => event.preventDefault()} // Prevent context menu
                className={"cell " + state}
                style={{backgroundColor: color}}>
                {text}
                <span style={{backgroundColor: color}}>{text2}</span>
            </span>
        );
    }
}
window.document.body.addEventListener("mouseup", () => {
    CellComponent.dragData = null;
});
