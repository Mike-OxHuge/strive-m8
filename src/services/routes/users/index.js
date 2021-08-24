import express from "express";
import UserModel from "./schema.js";
import { basicAuthMiddleware, adminOnly } from "../../auth/index.js";

const router = express.Router();

router
  .route("/")
  // get all users
  .get(basicAuthMiddleware, async (req, res, next) => {
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
  })

  //delete user, admin only
  .delete(basicAuthMiddleware, adminOnly, async (req, res, next) => {
    await UserModel.findOneAndDelete({ _id: req.body.id });
    res.send("user has been deleted");
  })

  // change role, admin only
  .put(basicAuthMiddleware, adminOnly, async (req, res, next) => {
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: { role: req.body.role },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(req.body);
    res.send(updatedUser);
  });

export default router;
