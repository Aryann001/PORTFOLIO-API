import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return next(new ErrorHandler(401, `Login to access this resource`));
  }

  const deData = jwt.verify(userToken, process.env.JWT_SECRET);

  req.user = await User.findById(deData._id);

  next();
});

export const authorizedRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          401,
          `${req.user.role} is not allowed to access this resource`
        )
      );
    }

    next();
  };
};
