import Joi from "joi";

const createJackpotWinnerValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    startTime: Joi.string()
        .required()
        .messages({
            'string.empty': 'Start time is required',
            'any.required': 'Start time is required'
        }),
    endTime: Joi.string()
        .required()
        .messages({
            'string.empty': 'End time is required',
            'any.required': 'End time is required'
        }),
    maxWinners: Joi.number()
        .required()
        .messages({
            'number.base': 'Max winners must be a number',
            'any.required': 'Max winners is required'
        })
});

const updateJackpotWinnerValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'ID is required',
            'any.required': 'ID is required'
        }),
    maxWinners: Joi.number()
        .messages({
            'number.base': 'Max winners must be a number',
            'any.required': 'Max winners is required'
        }),
    startTime: Joi.string()
        .messages({
            'string.empty': 'Start time is required',
            'any.required': 'Start time is required'
        }),
    endTime: Joi.string()
        .messages({
            'string.empty': 'End time is required',
            'any.required': 'End time is required'
        })
});

export { createJackpotWinnerValidation, updateJackpotWinnerValidation };