"use strict";
import {
actualizarHorarioService,
asignarEstudiantesAProfesorService,
asignarProfesorAHorarioService,
createHorarioService,
eliminarHorarioService,
finalizarHorarioService,
getEstudiantesPorProfesorService,
getHorariosPorLugarService, 
getHorariosPorProfesorService,
getProfesoresConEstudiantesService,
getHorariosPorEstudianteService,
} from "../services/comision.service.js";
import {
  actualizarHorarioValidation,
  asignarEstudiantesAProfesorValidation,
  asignarProfesorBodyValidation,
  createHorarioValidation,
  idHorarioParamValidation,
  idLugarParamValidation,
  idProfesorParamValidation,
} from "../validations/comision.validation.js";
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
    const lugares = await lugarRepository.find({
      order: {
        nombre: "ASC"
      }
    });
    
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
    // Validar body
    const { error, value } = createHorarioValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const messages = error.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { id_lugar, fecha, horaInicio, horaFin, modalidad } = value;
    const [nuevoHorario, serviceError] = await createHorarioService(
      id_lugar,
      fecha,
      horaInicio,
      horaFin,
      modalidad
    );
    
    if (serviceError) {
      return handleErrorClient(res, 400, serviceError);
    }

    return handleSuccess(res, 201, "Horario creado exitosamente", nuevoHorario);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener horarios por lugar */
export async function getHorariosPorLugar(req, res) {
  try {
    // Validar parámetro
    const { error, value } = idLugarParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (error) {
      const messages = error.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { id_lugar } = value;
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
    // Validar parámetro
    const { error: paramError, value: paramValue } = idHorarioParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (paramError) {
      const messages = paramError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    // Validar body
    const { error: bodyError, value: bodyValue } = actualizarHorarioValidation.validate(req.body, {
      abortEarly: false,
    });
    if (bodyError) {
      const messages = bodyError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { id_horario } = paramValue;
    const { fecha, horaInicio, horaFin, modalidad } = bodyValue;
    const [horarioActualizado, error] = await actualizarHorarioService(
      id_horario,
      fecha,
      horaInicio,
      horaFin,
      modalidad
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
    // Validar parámetro
    const { error: paramError, value } = idHorarioParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (paramError) {
      const messages = paramError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { id_horario } = value;
    const [exito, serviceError] = await eliminarHorarioService(id_horario);
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    return handleSuccess(res, 200, "Horario eliminado correctamente", exito);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Finalizar horario y desasignar estudiantes */
export async function finalizarHorario(req, res) {
  try {
    // Validar parámetro
    const { error: paramError, value } = idHorarioParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (paramError) {
      const messages = paramError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const [resultado, serviceError] = await finalizarHorarioService(value.id_horario);

    if (serviceError) {
      return handleErrorClient(res, 400, serviceError);
    }

    return handleSuccess(res, 200, "Horario finalizado y estudiantes desasignados correctamente", resultado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener horarios por profesor */
export async function getHorariosPorProfesor(req, res) {
  try {
    // Validar parámetro
    const { error, value } = idProfesorParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (error) {
      const messages = error.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { id_profesor } = value;
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
    // Validar parámetro
    const { error: paramError } = idHorarioParamValidation.validate({ id_horario: req.params.id_horario });
    if (paramError) {
      return handleErrorClient(res, 400, paramError.details[0].message);
    }

    // Validar body (solo id_profesor)
    const { error: bodyError, value } = asignarProfesorBodyValidation.validate(req.body, {
      abortEarly: false,
    });
    if (bodyError) {
      const messages = bodyError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const id_horario = Number(req.params.id_horario);
    const { id_profesor } = value;
    
    const [horarioAsignado, serviceError] = await asignarProfesorAHorarioService(
      id_horario,
      id_profesor
    );
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    return handleSuccess(res, 200, "Profesor asignado al horario", horarioAsignado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Asignar estudiantes a un profesor */
export async function asignarEstudiantesAProfesor(req, res) {
  try {
    // Validar parámetro
    const { error: paramError } = idProfesorParamValidation.validate({ id_profesor: req.params.id_profesor });
    if (paramError) {
      return handleErrorClient(res, 400, paramError.details[0].message);
    }

    // Validar listaEstudiantes
    const { error: bodyError, value } = asignarEstudiantesAProfesorValidation.validate(req.body, {
      abortEarly: false,
    });
    if (bodyError) {
      const messages = bodyError.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }

    const { listaEstudiantes } = value;

    const id_profesor = Number(req.params.id_profesor);
    
    const [profesorActualizado, serviceError] = await asignarEstudiantesAProfesorService(
      id_profesor,
      listaEstudiantes
    );
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    return handleSuccess(res, 200, "Estudiantes asignados al profesor", profesorActualizado);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener estudiantes por profesor */
export async function getEstudiantesPorProfesor(req, res) {
  try {
    // Validar parámetro
    const { error, value } = idProfesorParamValidation.validate(req.params, {
      abortEarly: false,
    });
    if (error) {
      const messages = error.details.map((e) => e.message).join(", ");
      return handleErrorClient(res, 400, messages);
    }
    const { id_profesor } = value;
    const [estudiantes, serviceError] = await getEstudiantesPorProfesorService(id_profesor);
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    return estudiantes.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Estudiantes encontrados", estudiantes);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener profesores con sus estudiantes */
export async function getProfesoresConEstudiantes(req, res) {
  try {
    const [profesores, serviceError] = await getProfesoresConEstudiantesService();
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    return profesores.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Profesores encontrados", profesores);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}

/* Obtener comisiones del estudiante autenticado */
export async function getMisComisiones(req, res) {
  try {
    // obtener id estudiante gracias atoken
    const estudianteId = req.user?.id;
    
    // por si las moscas
    if (!estudianteId) {
      return handleErrorClient(res, 401, "Usuario no autenticado correctamente");
    }

    // llamada a servicio
    const [comisiones, serviceError] = await getHorariosPorEstudianteService(estudianteId);

    // errores exclusivos de servicio
    if (serviceError) {
      // para debug
      return handleErrorClient(res, 400, serviceError);
    }

    // devolver respuesta exitosa (me costaste un mundo chinvelguencha)
    return handleSuccess(
      res, 
      200, 
      comisiones.length > 0 ? "Comisiones encontradas" : "No tienes comisiones asignadas",
      comisiones
    );

  } catch (error) {
    // errorses inesperados
    console.error("Error en getMisComisiones:", error);
    return handleErrorServer(res, 500, error.message);
  }
}