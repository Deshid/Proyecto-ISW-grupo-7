"use strict";
import { handleErrorClient } from "../handlers/responseHandlers.js";

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        });

        if (error) {
        const messages = error.details.map((detail) => detail.message).join("; ");
        return handleErrorClient(res, 400, messages);
        }

        req.body = value;
        next();
    };
};