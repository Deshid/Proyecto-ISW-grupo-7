import { Router } from "express";
import {
	actualizarHorario,
	asignarEstudiantesAProfesor,
	asignarProfesorAHorario,
	createHorario,
	eliminarHorario,
	finalizarHorario,
	getEstudiantesPorProfesor,
	getHorariosPorLugar,
	getHorariosPorProfesor,
	getLugares,
	getProfesoresConEstudiantes,
	getMisComisiones,
} from "../controllers/comision.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js"; //creo que solo lo usa el de getMisComisiones, o puede que no pero no me quiero arriesgar 

const router = Router();

/* Rutas de lugares */
router.get("/lugares", getLugares);

/* Rutas de horarios */
router.post("/horarios", createHorario);
router.get("/horarios/lugar/:id_lugar", getHorariosPorLugar);
router.put("/horarios/:id_horario", actualizarHorario);
router.delete("/horarios/:id_horario", eliminarHorario);
router.post("/horarios/:id_horario/finalizar", finalizarHorario);

/* Asignar profesor a horario */
router.post("/horarios/:id_horario/asignar-profesor", asignarProfesorAHorario);
/* Asignar estudiantes a profesor */
router.post("/profesor/:id_profesor/asignar-estudiantes", asignarEstudiantesAProfesor);
/* Obtener horarios por profesor */
router.get("/horarios/profesor/:id_profesor", getHorariosPorProfesor);
/* Obtener estudiantes por profesor */
router.get("/profesor/:id_profesor/estudiantes", getEstudiantesPorProfesor);
/* Obtener profesores con sus estudiantes */
router.get("/profesores", getProfesoresConEstudiantes);
/* Obtener comisiones (horarios) del estudiante autenticado */
router.get("/mis-comisiones", authenticateJwt, getMisComisiones); // aplicar (o no) middleware aquí

export default router;