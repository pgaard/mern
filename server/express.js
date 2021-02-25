import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import Template from "./../template";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import path from "path";
import devBundle from "./devBundle"; // dev only

// modules for server side rendering
import React from "react";
import ReactDOMServer from "react-dom/server";
import MainRouter from "./../client/MainRouter";
import { StaticRouter } from "react-router-dom";
import { ServerStyleSheets, ThemeProvider } from "@material-ui/styles";
import theme from "./../client/theme";

const app = express();
devBundle.compile(app); // dev only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
/*
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  */
app.use(cors());

const CURRENT_WORKING_DIR = process.cwd();
app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, "dist")));

app.use("/", userRoutes);
app.use("/", authRoutes);

// server side rendering
app.get("*", (req, res) => {
    const sheets = new ServerStyleSheets();
    const context = {};
    const markup = ReactDOMServer.renderToString(
        sheets.collect(
            <StaticRouter location={req.url} context={context}>
                <ThemeProvider theme={theme}>
                    <MainRouter />
                </ThemeProvider>
            </StaticRouter>
        )
    );

    // if router set a url, do a redirect
    if (context.url) {
        return res.redirect(303, context.url);
    }
    const css = sheets.toString();

    // with markup and css rendered to strings, we pass these to template
    res.status(200).send(
        Template({
            markup: markup,
            css: css,
        })
    );
});

// Catch unauthorised errors
app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: err.name + ": " + err.message });
    } else if (err) {
        res.status(400).json({ error: err.name + ": " + err.message });
        console.log(err);
    }
});

export default app;
