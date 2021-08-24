import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import router from "./services/routes/index.js";
const port = process.env.PORT || 3002;
const server = express();

// middleware
server.use(cors());
server.use(express.json());

//routes
server.use("/api", router);
// error handlers

// start

console.table(listEndpoints(server));

mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
});
