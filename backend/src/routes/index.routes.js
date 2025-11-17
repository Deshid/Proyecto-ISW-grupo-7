"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import evaluationRoutes from "./evaluation.routes.js";
import comisionRoutes from "./comision.routes.js";
import solicitudRoutes from "./solicitud.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/evaluation", evaluationRoutes)
    .use("/", comisionRoutes);
router.use("/solicitud", solicitudRoutes);

export default router;