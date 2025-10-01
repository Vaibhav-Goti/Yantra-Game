import Joi from "joi";

const buttonPressValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    // stopTime: Joi.string()
    //     .required()
    //     .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    //     .messages({
    //         'string.empty': 'Stop time is required',
    //         'string.pattern.base': 'Stop time must be in HH:MM format (e.g., 15:30)',
    //         'any.required': 'Stop time is required'
    //     }),
    buttonPresses: Joi.array()
        .items(
            Joi.object({
                buttonNumber: Joi.number()
                    .integer()
                    .min(1)
                    .max(12)
                    .required()
                    .messages({
                        'number.base': 'Button number must be a number',
                        'number.integer': 'Button number must be an integer',
                        'number.min': 'Button number must be at least 1',
                        'number.max': 'Button number cannot exceed 10',
                        'any.required': 'Button number is required'
                    }),
                pressCount: Joi.number()
                    .integer()
                    .min(0)
                    .required()
                    .messages({
                        'number.base': 'Press count must be a number',
                        'number.integer': 'Press count must be an integer',
                        'number.min': 'Press count cannot be negative',
                        'any.required': 'Press count is required'
                    })
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one button must be provided',
            'any.required': 'Button presses data is required'
        })
});

const gameResultValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    stopTime: Joi.string()
        .required()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .messages({
            'string.empty': 'Stop time is required',
            'string.pattern.base': 'Stop time must be in HH:MM format (e.g., 15:30)',
            'any.required': 'Stop time is required'
        })
});

const machineStatusValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    status: Joi.string()
        .valid('Active', 'Inactive', 'Maintenance')
        .required()
        .messages({
            'any.only': 'Status must be one of: Active, Inactive, Maintenance',
            'any.required': 'Status is required'
        })
});

export { 
    buttonPressValidation, 
    gameResultValidation, 
    machineStatusValidation 
};
