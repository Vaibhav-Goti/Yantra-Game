import Joi from "joi";

const userRegistrationValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
        }),
})

const userLoginValidation = Joi.object({
    // name: Joi.string().required(),
    email: Joi.string().email(),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
        }),
})

const userUpdateValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    // password: Joi.string()
    //     .min(8)
    //     .max(128)
    //     .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    //     .required()
    //     .messages({
    //         'string.min': 'Password must be at least 8 characters long',
    //         'string.max': 'Password must not exceed 128 characters',
    //         'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
    //     }),
})

const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
})

const changePasswordValidation = Joi.object({
    oldPassword: Joi.string().required().messages({
        'any.required': 'Old password is required'
    }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
            'any.required': 'New password is required'
        })
})

const resetPasswordValidation = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Reset token is required'
    }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
            'any.required': 'New password is required'
        })
})

export { userRegistrationValidation, userLoginValidation, userUpdateValidation, forgotPasswordValidation, changePasswordValidation, resetPasswordValidation }