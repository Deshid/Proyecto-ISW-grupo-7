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
      alumnoId: userFound.id,
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
      where: { alumnoId: userFound.id },
      order: { createdAt: "DESC" },
    });

    // Attach alumno object to each solicitud to preserve previous shape
    for (const s of solicitudes) {
      s.alumno = userFound;
    }

    return [solicitudes, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getSolicitudesByProfesorService() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudes = await solicitudRepository.find({
      order: { createdAt: "DESC" },
    });

    // Attach alumno objects (fetch per solicitud). This preserves the
    // previous response shape that included solicitud.alumno.
    const userRepository = AppDataSource.getRepository(User);
    for (const s of solicitudes) {
      if (s.alumnoId) {
        try {
          const u = await userRepository.findOneBy({ id: s.alumnoId });
          s.alumno = u || null;
        } catch (e) {
          s.alumno = null;
        }
      } else {
        s.alumno = null;
      }
    }

    return [solicitudes, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateSolicitudEstadoService(id, payload) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);

    const solicitudFound = await solicitudRepository.findOneBy({ id });
    if (!solicitudFound) return [null, "Solicitud no encontrada"];

    solicitudFound.estado = payload.estado;
    if (payload.justificacionProfesor) solicitudFound.justificacionProfesor = payload.justificacionProfesor;

    const saved = await solicitudRepository.save(solicitudFound);

    // attach alumno object if available
    const userRepository = AppDataSource.getRepository(User);
    if (saved.alumnoId) {
      try {
        saved.alumno = await userRepository.findOneBy({ id: saved.alumnoId });
      } catch (e) {
        saved.alumno = null;
      }
    } else {
      saved.alumno = null;
    }

    return [saved, null];
  } catch (error) {
    return [null, error.message];
  }
}
