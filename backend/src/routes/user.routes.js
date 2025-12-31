"use strict";
import { Router } from "express";
import { isAdmin, authorize } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  getStudents,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateJwt);

// Allow professors and admins to fetch students
router.get('/students', authorize(['profesor', 'administrador']), getStudents);

// Remaining routes require admin privileges
router.use(isAdmin);

router
  .get("/", getUsers)
  .get("/detail/", getUser)
  .patch("/detail/", updateUser)
  .delete("/detail/", deleteUser);

export default router;