"use strict";
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isProfesor } from "../middlewares/role.middleware.js";
import {
  createSolicitud,
  getSolicitudesStudent,
  getSolicitudesProfesor,
  updateSolicitudEstado,
  getEvaluacionesEstudiante,
  getPautas,
} from "../controllers/solicitud.controller.js";

const router = Router();

// Crea carpeta /uploads si no existe.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "solicitudes");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Tamaño maximo de imagen 10MB

// estudiante crea solicitud (posible archivo si es recuperacion)
router.post("/", authenticateJwt, upload.single("evidencia"), createSolicitud);

// obtener solicitudes del alumno autenticado
router.get("/student", authenticateJwt, getSolicitudesStudent);

// obtener todas las solicitudes (profesor)
router.get("/profesor", authenticateJwt, isProfesor, getSolicitudesProfesor);

// profesor actualiza estado y justificacion
router.patch("/:id", authenticateJwt, isProfesor, updateSolicitudEstado);

// obtener evaluaciones del estudiante
router.get("/evaluaciones", authenticateJwt, getEvaluacionesEstudiante);

// obtener todas las pautas
router.get("/pautas", authenticateJwt, getPautas);

export default router;