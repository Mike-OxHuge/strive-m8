import express from "express";
import CookieParser from "cookie-parser";
import UserModel from "./schema.js";
import {
  JWTAuthMiddleware,
  JWTAuth,
  renewTokens,
} from "../../auth-v2/index.js";
const router = express.Router();
// router.use(CookieParser());

router.route("/register").post(async (req, res) => {
  try {
    const user = new UserModel(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
});
router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    res.cookie("jwt", "boo", { httpOnly: true });
    if (user) {
      const { accessToken, refreshToken } = await JWTAuth(user);
      res.status(200).send({ accessToken, refreshToken }); // access token stays on client
    } else {
      next(createError(401, "Credentials not valid!"));
    }
  } catch (error) {
    next(error);
  }
});

router.route("/refresh-token").post(async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await renewTokens(
      req.headers.authorization
    );
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

router.route("/logout").post(JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.send();
  } catch (error) {
    next(error);
  }
});

router.route("/").get(JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
});

// router.route("/").get(async (req, res) => {
//   const users = await UserModel.find();
//   res
//     .status(200)
//     .cookie("users", users, { maxAge: 900000, httpOnly: true })
//     .send(users);
// });

export default router;

/* 
~~~~~~~~~ users list: ~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~ GUEST ~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{
    "name":"Boris",
    "email": "boris@guest.com",
    "password": "borisguest",
    "role": "Guest"
}

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~ HOST ~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{
    "name":"Britney",
    "email": "britney@host.com",
    "password": "britneyhost",
    "role": "Host"
}
*/
