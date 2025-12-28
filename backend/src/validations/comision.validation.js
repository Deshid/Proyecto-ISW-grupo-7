"use strict";
import Joi from "joi";

/* crear horario */
export const createHorarioValidation = Joi.object({
  id_lugar: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_lugar debe ser un número.",
      "number.integer": "El id_lugar debe ser un número entero.",
      "number.positive": "El id_lugar debe ser un número positivo.",
      "any.required": "El id_lugar es obligatorio.",
    }),
  fecha: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha debe ser una fecha válida.",
      "date.iso": "La fecha debe estar en formato (YYYY-MM-DD).",
      "any.required": "La fecha es obligatoria.",
    }),
  horaInicio: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "La hora de inicio debe estar en formato HH:MM.",
      "any.required": "La hora de inicio es obligatoria.",
    }),
  horaFin: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .custom((value, helpers) => {
      const horaInicio = helpers.state.ancestors[0].horaInicio;
      if (!horaInicio) return value;
      
      const [horaIni, minIni] = horaInicio.split(":");
      const [horaFin, minFin] = value.split(":");
      
      const minutosInicio = parseInt(horaIni) * 60 + parseInt(minIni);
      const minutosFin = parseInt(horaFin) * 60 + parseInt(minFin);
      
      if (minutosFin <= minutosInicio) {
        return helpers.error("any.invalid");
      }
      
      return value;
    })
    .messages({
      "string.pattern.base": "La hora de fin debe estar en formato HH:MM.",
      "any.required": "La hora de fin es obligatoria.",
      "any.invalid": "La hora de fin debe ser posterior a la hora de inicio.",
    }),
  modalidad: Joi.string()
    .valid("presencial", "online", "híbrida")
    .optional()
    .messages({
      "string.base": "La modalidad debe ser un texto.",
      "any.only": "La modalidad debe ser: presencial, online o híbrida.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten valores adicionales.",
  });

/* actualizar horario */
export const actualizarHorarioValidation = Joi.object({
  fecha: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha debe ser una fecha válida.",
      "date.iso": "La fecha debe estar en formato (YYYY-MM-DD).",
      "any.required": "La fecha es obligatoria.",
    }),
  modalidad: Joi.string()
    .valid("presencial", "online", "híbrida")
    .optional()
    .messages({
      "string.base": "La modalidad debe ser un texto.",
      "any.only": "La modalidad debe ser: presencial, online o híbrida.",
    }),
  horaInicio: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "La hora de inicio debe estar en formato HH:MM (24h).",
      "any.required": "La hora de inicio es obligatoria.",
    }),
  horaFin: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .custom((value, helpers) => {
      const horaInicio = helpers.state.ancestors[0].horaInicio;
      if (!horaInicio) return value;
      
      const [horaIni, minIni] = horaInicio.split(":");
      const [horaFin, minFin] = value.split(":");
      
      const minutosInicio = parseInt(horaIni) * 60 + parseInt(minIni);
      const minutosFin = parseInt(horaFin) * 60 + parseInt(minFin);
      
      if (minutosFin <= minutosInicio) {
        return helpers.error("any.invalid");
      }
      
      return value;
    })
    .messages({
      "string.pattern.base": "La hora de fin debe estar en formato HH:MM (24h).",
      "any.required": "La hora de fin es obligatoria.",
      "any.invalid": "La hora de fin debe ser posterior a la hora de inicio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

/* asignar profesor a horario */
export const asignarProfesorValidation = Joi.object({
  id_horario: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_horario debe ser un número.",
      "number.integer": "El id_horario debe ser un número entero.",
      "number.positive": "El id_horario debe ser un número positivo.",
      "any.required": "El id_horario es obligatorio.",
    }),
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten valores adicionales.",
  });

/* id_horario en URL */
export const idHorarioParamValidation = Joi.object({
  id_horario: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_horario debe ser un número.",
      "number.integer": "El id_horario debe ser un número entero.",
      "number.positive": "El id_horario debe ser un número positivo.",
      "any.required": "El id_horario es obligatorio.",
    }),
});

/* id_lugar en URL */
export const idLugarParamValidation = Joi.object({
  id_lugar: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_lugar debe ser un número.",
      "number.integer": "El id_lugar debe ser un número entero.",
      "number.positive": "El id_lugar debe ser un número positivo.",
      "any.required": "El id_lugar es obligatorio.",
    }),
});

/* id_profesor en URL */
export const idProfesorParamValidation = Joi.object({
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
});

/* Asignar profesor a horario */
export const asignarProfesorBodyValidation = Joi.object({
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten valores adicionales.",
  });

/* Asignar estudiantes a profesor */
export const asignarEstudiantesAProfesorValidation = Joi.object({
  listaEstudiantes: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .messages({
          "number.base": "Cada id de estudiante debe ser un número.",
          "number.integer": "Cada id de estudiante debe ser un número entero.",
          "number.positive": "Cada id de estudiante debe ser un número positivo.",
        })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "La lista de estudiantes debe ser un arreglo.",
      "array.min": "La lista de estudiantes debe contener al menos un id.",
      "any.required": "La lista de estudiantes es obligatoria.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten valores adicionales.",
  });
/* id_profesor en URL para asignar estudiantes */
export const idProfesorParamForEstudiantesValidation = Joi.object({
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
});

/* id_profesor en URL para obtener estudiantes */
export const idProfesorParamForGetEstudiantesValidation = Joi.object({
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
});

/* Obtener estudiantes por profesor */
export const getEstudiantesPorProfesorValidation = Joi.object({
  id_profesor: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id_profesor debe ser un número.",
      "number.integer": "El id_profesor debe ser un número entero.",
      "number.positive": "El id_profesor debe ser un número positivo.",
      "any.required": "El id_profesor es obligatorio.",
    }),
});
