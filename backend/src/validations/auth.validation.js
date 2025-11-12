"use strict";
import Joi from "joi";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@gmail.cl")) {
    return helper.message(
      "El correo electrónico debe finalizar en @gmail.cl."
    );
  }
  return value;
};

export const authValidation = Joi.object({
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe finalizar en @gmail.cl.",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombre: Joi.string()
    .min(5)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio.",
      "string.base": "El nombre debe ser de tipo texto.",
      "string.min": "El nombre debe tener al menos 5 caracteres.",
      "string.max": "El nombre debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe finalizar en @gmail.cl.",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatorio.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
})
  .unknown(false)
  .messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});