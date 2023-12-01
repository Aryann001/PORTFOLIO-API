import express from "express";
import {
  createOrUpdateAboutMe,
  createProject,
  createStack,
  deleteProject,
  deleteStack,
  forgotPassword,
  getProfile,
  getUsers,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
  updateProject,
  updateStack,
} from "../controllers/userController.js";
import { authorizedRole, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/register").post(register);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset").put(resetPassword);

router.route("/users").get(getUsers);

router
  .route("/admin/profile")
  .get(isAuthenticated, authorizedRole(`admin`), getProfile);

router
  .route("/admin/profile/update")
  .put(isAuthenticated, authorizedRole(`admin`), updateProfile);

router
  .route("/admin/profile/password")
  .put(isAuthenticated, authorizedRole(`admin`), updatePassword);

router
  .route("/admin/stack/create")
  .post(isAuthenticated, authorizedRole(`admin`), createStack);

router
  .route("/admin/stack/update")
  .put(isAuthenticated, authorizedRole(`admin`), updateStack);

router
  .route("/admin/stack/delete")
  .delete(isAuthenticated, authorizedRole(`admin`), deleteStack);

router
  .route("/admin/aboutme")
  .put(isAuthenticated, authorizedRole(`admin`), createOrUpdateAboutMe);

router
  .route("/admin/project/create")
  .post(isAuthenticated, authorizedRole(`admin`), createProject);

router
  .route("/admin/project/update/:projectId")
  .put(isAuthenticated, authorizedRole(`admin`), updateProject);

router
  .route("/admin/project/delete/:projectId")
  .delete(isAuthenticated, authorizedRole(`admin`), deleteProject);

export default router;
