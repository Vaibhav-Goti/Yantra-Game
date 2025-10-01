import Joi from "joi";

const timeFrameValidation = Joi.object({
    time: Joi.string()
        .required()
        .trim()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .messages({
            'string.empty': 'Time is required',
            'string.pattern.base': 'Time must be in HH:MM format (e.g., 14:30)'
        }),
    percentage: Joi.number()
        .required()
        .min(0)
        // .max(100)
        .messages({
            'number.base': 'Percentage must be a number',
            'number.min': 'Percentage cannot be less than 0',
            // 'number.max': 'Percentage cannot be greater than 100',
            'any.required': 'Percentage is required'
        }),
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        })
});

const timeFrameUpdateValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'TimeFrame ID is required',
            'any.required': 'TimeFrame ID is required'
        }),
    time: Joi.string()
        .trim()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .messages({
            'string.pattern.base': 'Time must be in HH:MM format (e.g., 14:30)'
        }),
    percentage: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.base': 'Percentage must be a number',
            'number.min': 'Percentage cannot be less than 0',
            'number.max': 'Percentage cannot be greater than 100'
        }),
    machineId: Joi.string()
        .messages({
            'string.empty': 'Machine ID cannot be empty'
        })
}).min(2).messages({
    'object.min': 'At least one field (other than ID) must be provided for update'
});

const timeFrameDeleteValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'TimeFrame ID is required',
            'any.required': 'TimeFrame ID is required'
        })
});

const timeFrameByMachineValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        })
});

export { 
    timeFrameValidation, 
    timeFrameUpdateValidation, 
    timeFrameDeleteValidation,
    timeFrameByMachineValidation 
};
