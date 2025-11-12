"use strict";
import {
actualizarHorarioService,
//asignarEstudiantesAProfesorService,
asignarProfesorAHorarioService,
createHorarioService,
eliminarHorarioService,
getHorariosPorLugarService, 
getHorariosPorProfesorService,
} from "../services/comision.service.js";
/* import {
  userBodyValidation,
  userQueryValidation,
} from "../validations/comision.validation.js"; */
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";


/* Obtener lugares */
export async function getLugares(req, res) {
  try {
    const lugarRepository = AppDataSource.getRepository("Lugar");
    const lugares = await lugarRepository.find();
    
    if (!lugares || lugares.length === 0) {
      return handleSuccess(res, 200, "No hay lugares disponibles", []);
    }
    
    return handleSuccess(res, 200, "Lugares encontrados", lugares);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}


/* Crear horario */
export async function createHorario(req, res) {
  try {
    const { id_lugar, fecha, horaInicio, horaFin } = req.body;
    const nuevoHorario = await createHorarioService(
      id_lugar,
      fecha,
      horaInicio,
      horaFin
    );
    if (!nuevoHorario)
      return handleErrorClient(res, 400, "No se pudo crear el horario");

    return handleSuccess(res, 201, "Horario creado exitosamente", nuevoHorario);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener horarios por lugar */
export async function getHorariosPorLugar(req, res) {
  try {
    const { id_lugar } = req.params;
    const horarios = await getHorariosPorLugarService(id_lugar);
    if (!horarios) return handleErrorClient(res, 404, "No se encontraron horarios");

    return horarios.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Horarios encontrados", horarios);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Actualizar horario */
export async function actualizarHorario(req, res) {
  try {
    const { id_horario } = req.params;
    const { fecha, horaInicio, horaFin } = req.body;
    const [horarioActualizado, error] = await actualizarHorarioService(
      id_horario,
      fecha,
      horaInicio,
      horaFin
    );
    if (error) return handleErrorClient(res, 400, error);

    return handleSuccess(res, 200, "Horario actualizado", horarioActualizado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Eliminar horario */
export async function eliminarHorario(req, res) {
  try {
    const { id_horario } = req.params;
    const [exito, error] = await eliminarHorarioService(id_horario);
    if (error) return handleErrorClient(res, 400, error);
    return handleSuccess(res, 200, "Horario eliminado correctamente", exito);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener horarios por profesor */
export async function getHorariosPorProfesor(req, res) {
  try {
    const { id_profesor } = req.params;
    const horarios = await getHorariosPorProfesorService(id_profesor);
    if (!horarios) return handleErrorClient(res, 404, "No se encontraron horarios");

    return horarios.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Horarios encontrados", horarios);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Asignar profesor a un horario */
export async function asignarProfesorAHorario(req, res) {
  try {
    const { id_horario, id_profesor } = req.body;
    const [horarioAsignado, error] = await asignarProfesorAHorarioService(
      id_horario,
      id_profesor
    );
    if (error) return handleErrorClient(res, 400, error);
    return handleSuccess(res, 200, "Profesor asignado al horario", horarioAsignado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}