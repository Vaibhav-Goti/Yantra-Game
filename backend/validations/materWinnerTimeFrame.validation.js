import Joi from "joi";

const createMasterWinnerTimeFrameValidation = Joi.object({
    time: Joi.string()
        .required()
        .trim()
        .messages({
            'string.empty': 'Time is required',
            'string.trim': 'Time cannot contain leading or trailing spaces'
        }),
    date: Joi.string()
        .required()
        .trim()
        .messages({
            'string.empty': 'Date is required',
            'string.trim': 'Date cannot contain leading or trailing spaces'
        }),
    percentage: Joi.number()
        .required()
        .min(0)
        // .max(100)
        .messages({
            'number.base': 'Percentage must be a number',
            'number.min': 'Percentage cannot be less than 0',
            // 'number.max': 'Percentage cannot be greater than 100'
        }),
    machineId: Joi.string()
        .required()
        .trim()
        .messages({
            'string.empty': 'Machine ID is required',
            'string.trim': 'Machine ID cannot contain leading or trailing spaces'
        })
});

export { createMasterWinnerTimeFrameValidation };