"use strict";
import Solicitud from "../entity/solicitud.entity.js";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { In } from "typeorm";

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
        if (Array.isArray(notasToSave)) {
          notasToSave = notasToSave.map(id => Number(id));
        }
      } catch (e) {
        notasToSave = Array.isArray(data.notas) ? data.notas.map(id => Number(id)) : null;
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

    for (const s of solicitudes) {
      s.alumno = userFound;
    }

    return [solicitudes, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getSolicitudesByProfesorService(emailProfesor) {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const userRepository = AppDataSource.getRepository(User);

    const profesor = await userRepository.findOne({
      where: { email: emailProfesor },
      relations: ['estudiantes']
    });
    
    if (!profesor) return [null, "Profesor no encontrado"];

    
    const estudianteIds = profesor.estudiantes.map(e => e.id);

    if (estudianteIds.length === 0) {
      return [[], null]; 
    }

    // Encuentra solicitudes solo de estudiantes asignados
    const solicitudes = await solicitudRepository.find({
      where: { alumnoId: In(estudianteIds) },
      order: { createdAt: "DESC" },
    });

   
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

    // Cargar evaluaciones para cada solicitud
    for (const s of solicitudes) {
      if (s.notas && s.notas.length > 0) {
        try {
          s.evaluaciones = await getEvaluacionesByIds(s.notas);
        } catch (e) {
          s.evaluaciones = [];
        }
      } else {
        s.evaluaciones = [];
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

    // Si es recuperación aprobada, marcar repiticion=true en las evaluaciones
    if (solicitudFound.tipo === "recuperacion" && payload.estado === "aprobada" && solicitudFound.notas && solicitudFound.notas.length > 0) {
      const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
      for (const evalId of solicitudFound.notas) {
        await evalRepo.update({ id: evalId }, { repiticion: true });
      }
    }

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

export async function getEvaluacionesEstudianteService(emailAlumno) {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const userFound = await userRepository.findOneBy({ email: emailAlumno });
    if (!userFound) return [null, "Usuario alumno no encontrado"];

    const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
    const evaluaciones = await evalRepo.find({
      where: { estudiante: { id: userFound.id } },
      relations: ["pauta"],
    });
    return [evaluaciones, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getEvaluacionesByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const evalRepo = AppDataSource.getRepository("EvaluacionEstudiante");
  const evaluaciones = await evalRepo.find({
    where: { id: In(ids) },
    relations: ["pauta", "estudiante"],
  });
  return evaluaciones;
}

export async function getPautasService() {
  try {
    const pautaRepo = AppDataSource.getRepository("Pauta");
    const pautas = await pautaRepo.find({
      relations: ["items", "creador"],
    });
    return [pautas, null];
  } catch (error) {
    return [null, error.message];
  }
}
