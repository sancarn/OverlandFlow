import {
    Button,
    FormControlLabel,
    Switch,
    Dialog,
    DialogTitle,
    Divider,
    WithStyles,
    withStyles,
    createStyles,
    Theme,
    Typography,
    List,
    ListItemText,
    ListItem,
    ListItemIcon,
    Avatar,
    MobileStepper,
    TextField,
} from "@material-ui/core";
import {
    Info as InfoIcon,
    ChevronLeft as LeftIcon,
    ChevronRight as RightIcon,
    Remove as RemoveIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
    KeyboardArrowLeft as KeyboardArrowLeftIcon,
    Visibility as VisibilityIcon,
    BorderAll as BorderIcon,
    EuroSymbol as EuroIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    GridOn as GridIcon,
    Timer as TimeIcon,
    Timeline as TimeLineIcon,
} from "@material-ui/icons";
// import InfoIcon from "@material-ui/icons/info";

import "../styling/grid.css";
import React from "react";
import CellComponent from "./cell";
import Cell from "../model/cell";
import Grid from "../model/grid";
import {initializeTerrain} from "../flow/terrain";

const styles = (theme: Theme) =>
    createStyles({
        info: {
            paddingBottom: theme.spacing.unit,
        },
        infoSection: {
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
        },
        dialogPaper: {
            minHeight: "610px",
        },
    });

interface Props extends WithStyles<typeof styles> {
    grid: Grid;
}

export default withStyles(styles)(
    class GridComponent extends React.Component<
        Props,
        {showSearchData: boolean; seed: number; scale: number}
    > {
        constructor(props) {
            super(props);
            this.state = {showSearchData: true, seed: 1, scale: 25};

            this.reset();
        }
        protected reset(): void {
            initializeTerrain(this.props.grid, this.state.seed, this.state.scale);
            this.props.grid.forEach(cell => {
                if (cell.isTarget() || cell.isSource()) cell.setNormal();
                cell.setFrontier(false);
                cell.setScore(-1);
            });
        }
        protected changeShowSearchData(showSearchData: boolean): void {
            this.setState({showSearchData: showSearchData});
        }

        protected renderCell(cell: Cell) {
            return (
                <CellComponent
                    key={cell.getID()}
                    searchRender={this.state.showSearchData}
                    cell={cell}
                />
            );
        }
        protected renderRow(row: Cell[], index: number) {
            return <div key={index}>{row.map(cell => this.renderCell(cell))}</div>;
        }
        render() {
            const grid = this.props.grid;
            const cells = grid.getCells();

            return (
                <div className="gridContainer">
                    <div className="gridControls">
                        <Button onClick={this.reset.bind(this)} variant="contained" color="primary">
                            Reset
                        </Button>
                        <TextField
                            id="seed"
                            type="number"
                            label="Seed"
                            value={this.state.seed}
                            onKeyDown={ev => {
                                if (ev.key === "Enter") this.reset();
                            }}
                            onChange={e => this.setState({seed: Number(e.target.value)})}
                        />
                        <TextField
                            id="scale"
                            type="number"
                            label="Scale"
                            value={this.state.scale}
                            onKeyPress={ev => {
                                if (ev.key === "Enter") this.reset();
                            }}
                            onChange={e => this.setState({scale: Number(e.target.value)})}
                        />
                    </div>
                    <div className="grid">{cells.map((row, i) => this.renderRow(row, i))}</div>
                </div>
            );
        }

        renderQuote(props) {
            return (
                <span
                    style={{
                        backgroundColor: "rgba(0,0,0,0.05)",
                        borderRadius: props.radius || 3,
                        paddingLeft: 2,
                        paddingRight: 2,
                    }}>
                    {props.children}
                </span>
            );
        }
        renderListItem(props) {
            return (
                <ListItem>
                    <Avatar>{props.icon}</Avatar>
                    <ListItemText primary={props.name} secondary={props.text} />
                </ListItem>
            );
        }
    }
);
