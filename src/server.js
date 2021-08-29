import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import CookieParser from "cookie-parser";
import router from "./services/routes/index.js";
import {
  forbiddenHandler,
  unAuthorizedHandler,
  catchAllHandler,
} from "./errorHandlers.js";

const port = process.env.PORT;
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
console.table(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("the server is connected to DB"));

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
});
