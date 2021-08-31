import server from "./server.js";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";

const port = process.env.PORT;

console.table(listEndpoints(server));

mongoose
  .connect(`${process.env.MONGO_CONNECTION}/strive-m8`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("the server is connected to DB"));

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
});
