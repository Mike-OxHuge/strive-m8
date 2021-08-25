import createError from "http-errors";
import atob from "atob";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import UserModel from "../../services/routes/users/schema.js";

/* ~~~~~~~~~~~~~~~~~~ BASIC AUTH ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
export const basicAuthMiddleware = async (req, res, next) => {
  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)

  console.log(req.headers);

  if (!req.headers.authorization) {
    next(
      createError(
        401,
        "Please provide credentials in the Authorization header!"
      )
    );
  } else {
    // 2. Split and Decode base64 and extract credentials from the Authorization header ( base64 --> string)

    const decoded = atob(req.headers.authorization.split(" ")[1]);
    // console.log(decoded);

    const [email, password] = decoded.split(":");
    // 3. Check the validity of the credentials (find the user in db via email, and compare plainPW with the hashed one), if they are not ok --> trigger an error (401)
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      // 4. If credentials are valid we proceed to what is next (another middleware or route handler)
      req.user = user;
      next();
    } else {
      next(createError(401, "Credentials are not correct!"));
    }
  }
};

/* ~~~~~~~~~~~~~~~~~~~~~~ADMIN ONLY ~~~~~~~~~~~~~~~~~~~~~~~ */
export const adminOnly = (req, res, next) => {
  if (req.user.role === "Admin") {
    next();
  } else {
    next(createError(403, "Admins only!"));
  }
};

/* `~~~~~~~~~~~~~~~~~~~~~~~ JWT AUTH ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
export const JWTAuthenticate = async (user) => {
  // 1. given the user ==> generate the tokens with user._id as payload
  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefreshJWT({ _id: user._id });

  // 2. save refresh token in db

  user.refreshToken = refreshToken;

  await user.save();

  return { accessToken, refreshToken };
};

const generateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

const generateRefreshJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

// generateJWT()
//   .then(token => console.log(token))
//   .catch(err => console.log(err))

export const verifyJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

const verifyRefreshJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

// const promisifiedJWTSign = promisify(jwt.sign)

// promisifiedJWTSign(payload, ).then()

export const refreshTokens = async (actualRefreshToken) => {
  try {
    // 1. Is the actual refresh token still valid?

    const decoded = await verifyRefreshJWT(actualRefreshToken);

    // 2. If the token is valid we are going to find the user in db

    const user = await UserModel.findById(decoded._id);

    if (!user) throw new Error("User not found");

    // 3. Once we have the user we can compare actualRefreshToken with the one stored in db

    if (actualRefreshToken === user.refreshToken) {
      // 4. If everything is fine we can generate the new pair of tokens

      const { accessToken, refreshToken } = await JWTAuthenticate(user);
      return { accessToken, refreshToken };
    } else {
    }
  } catch (error) {
    throw new Error("Token not valid!");
  }
};

export const JWTAuthMiddleware = async (req, res, next) => {
  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)
  console.log(req.headers);
  if (!req.headers.authorization) {
    next(
      createError(
        401,
        "Please provide credentials in the Authorization header!"
      )
    );
  } else {
    // 2. Extract the token from the authorization header (authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTI0Yjg2OTAwNTk3ZTZkMGNkMmI3Y2UiLCJpYXQiOjE2Mjk4ODA5NTgsImV4cCI6MTYzMDQ4NTc1OH0.wznk3kWrfwSXn5gike8SIKozrR-ppJEn85ypSVXYuTc)

    try {
      const token = req.headers.authorization.replace("Bearer ", "");

      // 3. Verify token

      const decodedToken = await verifyJWT(token);

      // 4. Find the user in db by id

      const user = await UserModel.findById(decodedToken._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, "User not found!"));
      }
    } catch (error) {
      next(createError(401, "Token Expired!"));
    }
  }
};
