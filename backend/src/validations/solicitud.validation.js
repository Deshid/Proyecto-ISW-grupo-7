"use strict";
import Joi from "joi";

export const createSolicitudValidation = Joi.object({
  tipo: Joi.string()
    .valid("revision", "recuperacion")
    .required()
    .messages({
      "any.only": "El tipo debe ser 'revision' o 'recuperacion'",
      "any.required": "El tipo es obligatorio",
    }),

  notas: Joi.array().items(Joi.any()).optional(), // 👈 acepta cualquier estructura o vacío
  modalidad: Joi.string().valid("presencial", "online").optional(),
  descripcion: Joi.string().max(1000).allow('').optional(), // 👈 ahora permitida incluso vacía
}).unknown(true); // 👈 permite campos adicionales (por ejemplo: evidenciaPath)

export const updateSolicitudValidation = Joi.object({
  estado: Joi.string().valid("pendiente", "aprobada", "rechazada").required(),
  justificacionProfesor: Joi.string().max(1000).optional(),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales al actualizar",
});
