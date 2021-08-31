import express from "express";
import cors from "cors";
import CookieParser from "cookie-parser";
import router from "./services/routes/index.js";
import {
  forbiddenHandler,
  unAuthorizedHandler,
  catchAllHandler,
} from "./errorHandlers.js";

const server = express();

// middleware
server.use(express.json());
server.use(cors({ origin: "http://localhost:3000", credentials: true }));
server.use(CookieParser());

//routes
server.use("/api", router);

// error handlers
server.use(unAuthorizedHandler, forbiddenHandler, catchAllHandler);

// start

export default server;
