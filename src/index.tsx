import React from "react";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core/styles";
import ReactDOM from "react-dom";

import "./styling/index.css";
import GridComponent from "./rendering/grid";
import Grid from "./model/grid";
import Searcher from "./search/search";

const grid = new Grid({width: 150, height: 70});

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        primary: {
            main: "#2979ff",
            light: "#5692fa",
            dark: "#0052e2",
        },
    },
});
ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <div className="app">
            <GridComponent grid={grid} />
            <Searcher grid={grid} />
        </div>
    </MuiThemeProvider>,
    document.getElementById("root")
);
