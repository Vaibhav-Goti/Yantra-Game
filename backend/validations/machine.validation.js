import Joi from "joi";

const machineValidation = Joi.object({
    machineName: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(100)
        .messages({
            'string.empty': 'Machine name is required',
            'string.min': 'Machine name must be at least 2 characters long',
            'string.max': 'Machine name cannot exceed 100 characters'
        }),
    machineNumber: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(50)
        .messages({
            'string.empty': 'Machine number is required',
            'string.min': 'Machine number must be at least 1 character long',
            'string.max': 'Machine number cannot exceed 50 characters'
        }),
    status: Joi.string()
        .valid('Active', 'Inactive', 'Maintenance')
        .default('Active')
        .messages({
            'any.only': 'Status must be one of: Active, Inactive, Maintenance'
        }),
    location: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .messages({
            'string.max': 'Location cannot exceed 200 characters'
        }),
    description: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    depositAmount: Joi.number()
        .min(0)
        .messages({
            'number.base': 'Deposit amount must be a number',
            'number.min': 'Deposit amount cannot be negative'
        })
});

const machineUpdateValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    machineName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            'string.min': 'Machine name must be at least 2 characters long',
            'string.max': 'Machine name cannot exceed 100 characters'
        }),
    machineNumber: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .messages({
            'string.min': 'Machine number must be at least 1 character long',
            'string.max': 'Machine number cannot exceed 50 characters'
        }),
    status: Joi.string()
        .valid('Active', 'Inactive', 'Maintenance')
        .messages({
            'any.only': 'Status must be one of: Active, Inactive, Maintenance'
        }),
    location: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .messages({
            'string.max': 'Location cannot exceed 200 characters'
        }),
    description: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),
    depositAmount: Joi.number()
        .min(0)
        .messages({
            'number.base': 'Deposit amount must be a number',
            'number.min': 'Deposit amount cannot be negative'
        })
}).min(2).messages({
    'object.min': 'At least one field (other than ID) must be provided for update'
});

const machineDeleteValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        })
});

const addDepositValidation = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    amount: Joi.number()
        .min(1)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Amount must be greater than 0',
            'any.required': 'Amount is required'
        }),
    note: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Note cannot exceed 500 characters'
        })
});

// Transaction validation schemas
const addAmountValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    amount: Joi.number()
        .min(1)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Amount must be greater than 0',
            'any.required': 'Amount is required'
        }),
    note: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Note cannot exceed 500 characters'
        })
});

const withdrawAmountValidation = Joi.object({
    machineId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Machine ID is required',
            'any.required': 'Machine ID is required'
        }),
    amount: Joi.number()
        .min(1)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.min': 'Amount must be greater than 0',
            'any.required': 'Amount is required'
        }),
    note: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Note cannot exceed 500 characters'
        })
});

export { 
    machineValidation, 
    machineUpdateValidation, 
    machineDeleteValidation, 
    addDepositValidation,
    addAmountValidation,
    withdrawAmountValidation
};
