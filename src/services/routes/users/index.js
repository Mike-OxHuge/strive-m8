import express from "express";
import UserModel from "./schema.js";
import {
  basicAuthMiddleware,
  adminOnly,
  JWTAuthMiddleware,
  JWTAuthenticate,
  refreshTokens,
} from "../../auth/index.js";

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

// proper register
router.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. verify credentials
    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      // 2. Generate tokens if credentials are ok
      const { accessToken, refreshToken } = await JWTAuthenticate(user);
      // 3. Send tokens back as a response
      res.send({ accessToken, refreshToken }); // access token stays on client
    } else {
      next(createError(401, "Credentials not valid!"));
    }
  } catch (error) {
    next(error);
  }
});

router.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.name = req.body.name; // modify req.user with the fields coming from req.body
    await req.user.save();

    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

export default router;
