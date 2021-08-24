import createError from "http-errors";
import atob from "atob";
import UserModel from "../../services/routes/users/schema.js";

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
