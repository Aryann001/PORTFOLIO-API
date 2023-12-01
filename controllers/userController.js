import User from "../models/userModel.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import cloudinary from "cloudinary";
import sendCookie from "../utils/sendCookie.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";

export const register = catchAsyncError(async (req, res, next) => {
  let avatarLink = {
    public_id: "Public_id",
    url: "/Profile.png",
  };

  if (req.body.avatar !== undefined) {
    const result = await cloudinary.v2.uploader.upload(avatar, {
      folder: "portfolioAvatar",
    });

    avatarLink.public_id = result.public_id;
    avatarLink.url = result.secure_url;
  }

  req.body.avatar = avatarLink;

  const user = await User.create(req.body);

  sendCookie(res, user, 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler(400, "Invalid email or password"));
  }

  const isMatch = await user.checkPassword(password);

  if (!isMatch) {
    return next(new ErrorHandler(400, "Invalid email or password"));
  }

  sendCookie(res, user, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "Production" ? true : false,
  };

  res.status(200).cookie("userToken", null, options).json({
    success: true,
    message: "Successfully logged out",
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler(400, "User Not Found"));
  }

  user.resetPasswordOtp = Math.floor(100000 + Math.random() * 900000);
  user.resetPasswordOtpExpiry = new Date(Date.now() + 1000 * 60 * 10);

  sendEmail({
    email,
    subject: "PORTFOLIO : Password Reset OTP",
    message: `Hello ${user.name},\n\nYour reset password OTP:\n\n${user.resetPasswordOtp}\n\nIf you did not make this request, please ignore this email and your password will remain unchanged.\n\nSincerely,\nPORTFOLIO`,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: `Password reset OTP has been sent to ${email}`,
    emailSend: true,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { newPassword, confirmPassword, resetPasswordOtp } = req.body;

  const user = await User.findOne({
    resetPasswordOtp,
    resetPasswordOtpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler(400, "Invalid OTP or OTP has been expired"));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  user.password = newPassword;
  user.resetPasswordOtp = null;
  user.resetPasswordOtpExpiry = null;

  await user.save();

  sendCookie(res, user, 200);
});

export const getProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const getUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);

  if (req.body.avatar !== undefined) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "portfolioAvatar",
    });

    req.body.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  sendCookie(res, user, 200);
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.checkPassword(oldPassword);

  if (!isMatch) {
    return next(new ErrorHandler(400, "Invalid old password"));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(400, "Passwords do not match"));
  }

  user.password = newPassword;

  await user.save();

  sendCookie(res, user, 200);
});

export const createStack = catchAsyncError(async (req, res, next) => {
  let stackLink = [];

  if (typeof req.body.stack === "string") {
    stackLink.push(req.body.stack);
  } else {
    stackLink = req.body.stack;
  }

  let stackLinkArr = [];

  for (let i = 0; i < stackLink.length; i++) {
    const result = await cloudinary.v2.uploader.upload(stackLink[i], {
      folder: "portfolioStack",
    });

    stackLinkArr.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.stack = stackLinkArr;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { techStack: req.body.stack },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  sendCookie(res, user, 200);
});

export const updateStack = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);

  let stackLink = [];

  if (typeof req.body.stack === "string") {
    stackLink.push(req.body.stack);
  } else {
    stackLink = req.body.stack;
  }

  let stackLinkArr = [];

  if (req.body.stack !== undefined) {
    for (let i = 0; i < user.techStack.length; i++) {
      await cloudinary.v2.uploader.destroy(user.techStack[i].public_id);
    }

    for (let i = 0; i < stackLink.length; i++) {
      const result = await cloudinary.v2.uploader.upload(stackLink[i], {
        folder: "portfolioStack",
      });

      stackLinkArr.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.stack = stackLinkArr;
  }

  user = await User.findByIdAndUpdate(
    req.user._id,
    { techStack: req.body.stack },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  sendCookie(res, user, 200);
});

export const deleteStack = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);

  for (let i = 0; i < user.techStack.length; i++) {
    await cloudinary.v2.uploader.destroy(user.techStack[i].public_id);
  }

  user = await User.findByIdAndUpdate(
    req.user._id,
    { techStack: [] },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  sendCookie(res, user, 200);
});

export const createOrUpdateAboutMe = catchAsyncError(async (req, res, next) => {
  const aboutMe = {
    heading: req.body.heading,
    description: req.body.description,
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { aboutMe },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  sendCookie(res, user, 200);
});

export const createProject = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const project = {
    title: req.body.title,
    description: req.body.description,
    github: req.body.github,
    projectLink: req.body.projectLink,
  };

  let stack = [];

  if (typeof req.body.stack === "string") {
    stack.push(req.body.stack);
  } else {
    stack = req.body.stack;
  }

  let stackArr = [];

  for (let i = 0; i < stack.length; i++) {
    stackArr.push({
      stackStr: stack[i],
    });
  }

  project.stack = stackArr;

  if (req.body.image !== undefined) {
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "portfolioProject",
    });

    project.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  if (user.projects.length === 0) {
    user.projects = [project];
  } else {
    user.projects.push(project);
  }

  await user.save({ suppressWarning: true });

  sendCookie(res, user, 200);
});

export const deleteProject = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { projectId } = req.params;

  const projects = user.projects.filter(
    (pj) => pj._id.toString() !== projectId.toString()
  );

  user.projects = projects;

  await user.save({ suppressWarning: true });

  sendCookie(res, user, 200);
});

export const updateProject = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { projectId } = req.params;

  const project = user.projects.find(
    (pj) => pj._id.toString() === projectId.toString()
  );

  const projectData = {
    title: req.body.title,
    description: req.body.description,
    github: req.body.github,
    projectLink: req.body.projectLink,
  };

  let stack = [];

  if (typeof req.body.stack === "string") {
    stack.push(req.body.stack);
  } else {
    stack = req.body.stack;
  }

  let stackArr = [];

  for (let i = 0; i < stack.length; i++) {
    stackArr.push({
      stackStr: stack[i],
    });
  }

  projectData.stack = stackArr;

  if (req.body.image !== undefined) {
    await cloudinary.v2.uploader.destroy(project.image.public_id);

    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "portfolioProject",
    });

    projectData.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    project.image = projectData.image;
  }

  project.title = projectData.title;
  project.description = projectData.description;
  project.github = projectData.github;
  project.projectLink = projectData.projectLink;
  project.stack = projectData.stack;

  await project.save({ suppressWarning: true });

  sendCookie(res, user, 200);
});
