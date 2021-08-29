import createError from "http-errors";
import jwt from "jsonwebtoken";
import UserModel from "../../services/routes/users-v2/schema.js";

/* ~~~~~~~~~ creating tokens ~~~~~~~~~ */
const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "60m" },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    )
  );

const createRefreshToken = (payload) =>
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

/* ~~~~~~~~~ verifying tokens ~~~~~~~~~ */
export const verifyJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    })
  );

const verifyRefreshJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

/* ~~~~~~~~~ auth with tokens ~~~~~~~~~ */
export const JWTAuth = async (user) => {
  const accessToken = await createAccessToken({
    _id: user._id,
    role: user.role,
    name: user.name,
  });
  const refreshToken = await createRefreshToken({
    _id: user._id,
    role: user.role,
    name: user.name,
  });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

/* ~~~~~~~~~ auth with credentials ~~~~~~~~~ */
export const JWTAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(createError(401));
  }
  try {
    const decodedToken = await verifyJWT(token.replace("Bearer ", ""));
    const user = await UserModel.findById(decodedToken._id);
    if (user) {
      req.user = user;
      next();
    } else {
      next(createError(404, "User not found!"));
    }
  } catch (err) {
    return next(createError(401));
  }
};

/* ~~~~~~~~~ renew tokens ~~~~~~~~~ */
export const renewTokens = async (actualRefreshToken) => {
  try {
    const decoded = await verifyRefreshJWT(
      actualRefreshToken.replace("Bearer ", "")
    );
    const user = await UserModel.findById(decoded._id);
    if (!user) {
      throw new Error("User not found");
    }
    if (
      actualRefreshToken.replace("Bearer ", "") ===
      user.refreshToken.replace("Bearer ", "")
    ) {
      const { accessToken, refreshToken } = await JWTAuth(user);
      return { accessToken, refreshToken };
    } else {
      throw new Error("Refresh token is not valid");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Token not valid!");
  }
};

/* ~~~~~~~~~ host only ~~~~~~~~~ */
export const hostOnly = (req, res, next) => {
  if (req.user.role === "Host") {
    next();
  } else {
    next(createError(403, "Hosts only!"));
  }
};
