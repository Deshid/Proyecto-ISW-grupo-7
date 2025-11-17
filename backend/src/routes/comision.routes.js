import { Router } from "express";
import {
	actualizarHorario,
	asignarProfesorAHorario,
	createHorario,
	eliminarHorario,
	getHorariosPorLugar,
	getHorariosPorProfesor,
	getLugares,
} from "../controllers/comision.controller.js";

const router = Router();

/* Rutas de lugares */
router.get("/lugares", getLugares);

/* Rutas de horarios */
router.post("/horarios", createHorario);
router.get("/horarios/lugar/:id_lugar", getHorariosPorLugar);
router.put("/horarios/:id_horario", actualizarHorario);
router.delete("/horarios/:id_horario", eliminarHorario);

/* Asignar profesor a horario */
router.post("/horarios/:id_horario/asignar-profesor", asignarProfesorAHorario);
/* Obtener horarios por profesor */
router.get("/horarios/profesor/:id_profesor", getHorariosPorProfesor);

export default router;