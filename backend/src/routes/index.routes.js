"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import evaluationRoutes from "./evaluation.routes.js";
import comisionRoutes from "./comision.routes.js";
import solicitudRoutes from "./solicitud.routes.js";
import subjectRoutes from "./subject.routes.js";
import subjectAssignRoutes from "./subjectAssign.routes.js";
// Importa el controlador de limpieza (TEMPORAL)
import cleanupRoutes from "./Cleanup.routes.js";


const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/evaluation", evaluationRoutes)
    .use("/", comisionRoutes)
    .use("/subject", subjectRoutes)
    .use("/subjectAssign", subjectAssignRoutes)
    // Añade esto DESPUÉS de tus otras rutas (pero ANTES del 404):
    .use("/temp", cleanupRoutes);  // Ruta temporal - eliminar después
router.use("/solicitud", solicitudRoutes);

export default router;