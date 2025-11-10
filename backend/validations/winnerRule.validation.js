import Joi from "joi";

const winnerRuleValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    sessionId: Joi.string()
        .optional()
        .messages({
            'string.empty': 'Session ID is required',
            'any.required': 'Session ID is required'
        }),
    startTime: Joi.string()
        .optional()
        .messages({
            'string.empty': 'Start time is required',
            'any.required': 'Start time is required'
        }),
    endTime: Joi.string()
        .optional()
        .messages({
            'string.empty': 'End time is required',
            'any.required': 'End time is required'
        }),
    allowedButtons: Joi.array()
        .items(Joi.number())
        .required()
        .messages({
            'array.base': 'Allowed buttons must be an array',
            'array.required': 'Allowed buttons are required'
        })
});

const winnerRuleUpdateValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'ID is required',
            'any.required': 'ID is required'
        }),
});

export { winnerRuleValidation, winnerRuleUpdateValidation };