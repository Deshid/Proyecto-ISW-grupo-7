"use strict";
import {
  createSolicitudService,
  getSolicitudesByStudentService,
  getSolicitudesByProfesorService,
  updateSolicitudEstadoService,
} from "../services/solicitud.service.js";
import { createSolicitudValidation, updateSolicitudValidation } from "../validations/solicitud.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function createSolicitud(req, res) {
  try {
    const body = req.body || {};

    const { error } = createSolicitudValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    // additional checks according to tipo
    if (body.tipo === "revision") {
      let notas = [];
      if (body.notas) {
        try {
          notas = typeof body.notas === 'string' ? JSON.parse(body.notas) : body.notas;
        } catch (e) {
          notas = Array.isArray(body.notas) ? body.notas : [];
        }
      }
      if (notas.length === 0) return handleErrorClient(res, 400, "Para solicitudes de revisión se debe indicar al menos una nota");
    }

    if (body.tipo === "recuperacion") {
      if (!body.descripcion || body.descripcion.trim().length === 0) return handleErrorClient(res, 400, "La recuperación requiere una descripción del caso");
      // evidencia (file) is required for recuperacion
      if (!req.file) return handleErrorClient(res, 400, "La recuperación requiere imagen de evidencia");
    }

  const evidenciaPath = req.file ? `${req.protocol}://${req.get('host')}/uploads/solicitudes/${req.file.filename}` : null;

    const [created, err] = await createSolicitudService({
      emailAlumno: req.user.email,
      tipo: body.tipo,
      notas: body.notas,
      modalidad: body.modalidad,
      descripcion: body.descripcion,
      evidenciaPath,
    });

    if (err) return handleErrorServer(res, 500, err);

    handleSuccess(res, 201, "Solicitud creada correctamente", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getSolicitudesStudent(req, res) {
  try {
    const [solicitudes, err] = await getSolicitudesByStudentService(req.user.email);
    if (err) return handleErrorClient(res, 404, err);

    solicitudes.length === 0 ? handleSuccess(res, 204) : handleSuccess(res, 200, "Solicitudes del alumno", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getSolicitudesProfesor(req, res) {
  try {
    const [solicitudes, err] = await getSolicitudesByProfesorService();
    if (err) return handleErrorClient(res, 404, err);

    solicitudes.length === 0 ? handleSuccess(res, 204) : handleSuccess(res, 200, "Solicitudes encontradas", solicitudes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateSolicitudEstado(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const { error } = updateSolicitudValidation.validate(body);
    if (error) return handleErrorClient(res, 400, error.message);

    const [updated, err] = await updateSolicitudEstadoService(Number(id), body);
    if (err) return handleErrorClient(res, 404, err);

    handleSuccess(res, 200, "Solicitud actualizada", updated);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
