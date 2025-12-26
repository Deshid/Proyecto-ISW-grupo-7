"use strict";
import { Router } from "express";
import { CleanupController } from "../controllers/CleanupController.js";

const router = Router();

// RUTA TEMPORAL - Eliminar después de usar
router.post("/cleanup-orphans", CleanupController.cleanupOrphanRelations);

// Ruta para verificar sin eliminar
router.get("/check-orphans", CleanupController.checkOrphanRelations);

//router.get("/debug-structure", CleanupController.debugTableStructure);

//router.get("/table-info", CleanupController.getTableInfo);

//router.get("/find-table", CleanupController.findCorrectTable);


export default router;