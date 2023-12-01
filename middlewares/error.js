import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  err.message = err.message || `Internal Server Error`;
  err.status = err.status || 500;

  if (err.name === `CastError`) {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(400, message);
  }

  if (err.code === 11000) {
    const message = `Duplicate Key ${Object.keys(err.keyValue)}`;
    err = new ErrorHandler(400, message);
  }

  if (err.name === `JsonWebTokenError`) {
    const message = `Invalid JWT`;
    err = new ErrorHandler(400, message);
  }

  if (err.name === `TokenExpiredError`) {
    const message = `JWT is Expired`;
    err = new ErrorHandler(400, message);
  }

  res.status(err.status).json({
    success: false,
    message: err.message,
  });
};
