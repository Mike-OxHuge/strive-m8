import express from "express";
import UserModel from "./schema.js";

const router = express.Router();

router
  .route("/")
  // get all users
  .get(async (req, res, next) => {
    try {
      const users = await UserModel.find({});
      res.send(users);
    } catch (error) {
      console.log(error);
    }
  })

  //create user
  .post(async (req, res, next) => {
    try {
      const user = new UserModel(req.body);
      await user.save();
      res.status(201).send(user);
    } catch (error) {
      console.log(error);
    }
  });

export default router;
