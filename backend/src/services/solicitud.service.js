"use strict";
import Solicitud from "../entity/solicitud.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createSolicitudService(data) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: data.emailAlumno });
    if (!userFound) return [null, "Usuario alumno no encontrado"];

    let notasToSave = null;
    if (data.notas) {
      try {
        notasToSave = typeof data.notas === 'string' ? JSON.parse(data.notas) : data.notas;
      } catch (e) {
        notasToSave = Array.isArray(data.notas) ? data.notas : null;
      }
    }

    const solicitudToSave = solicitudRepository.create({
      tipo: data.tipo,
      notas: notasToSave || null,
      modalidad: data.modalidad || null,
      descripcion: data.descripcion || null,
      evidenciaPath: data.evidenciaPath || null,
      estado: "pendiente",
      alumno: userFound,
    });

    const saved = await solicitudRepository.save(solicitudToSave);
    return [saved, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getSolicitudesByStudentService(emailAlumno) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOneBy({ email: emailAlumno });
    if (!userFound) return [null, "Usuario alumno no encontrado"];

    const solicitudes = await solicitudRepository.find({
      where: { alumno: { id: userFound.id } },
      relations: ["alumno"],
      order: { createdAt: "DESC" },
    });

    return [solicitudes, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getSolicitudesByProfesorService() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudes = await solicitudRepository.find({
      relations: ["alumno"],
      order: { createdAt: "DESC" },
    });

    return [solicitudes, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateSolicitudEstadoService(id, payload) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudFound = await solicitudRepository.findOne({ where: { id }, relations: ["alumno"] });
    if (!solicitudFound) return [null, "Solicitud no encontrada"];

    solicitudFound.estado = payload.estado;
    if (payload.justificacionProfesor) solicitudFound.justificacionProfesor = payload.justificacionProfesor;

    const saved = await solicitudRepository.save(solicitudFound);
    return [saved, null];
  } catch (error) {
    return [null, error.message];
  }
}
