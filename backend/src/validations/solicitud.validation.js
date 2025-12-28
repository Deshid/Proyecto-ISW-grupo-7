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

  notas: Joi.array().items(Joi.any()).optional(),
  modalidad: Joi.string().valid("presencial", "online"),
  descripcion: Joi.string().max(200).allow('').messages({
    "string.max": "La descripción no puede exceder los 200 caracteres",
  }),
}).unknown(true); 

export const updateSolicitudValidation = Joi.object({
  estado: Joi.string().valid("pendiente", "aprobada", "rechazada").required(),
  justificacionProfesor: Joi.string().max(200).optional().empty(""),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales al actualizar",
});
