const sendCookie = (res, user, statusCode) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * process.env.JWT_EXPIRES
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("userToken", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendCookie;
