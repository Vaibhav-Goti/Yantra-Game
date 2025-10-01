import ErrorHandler from "../utils/errorHandler.js";

const reqBodyValidator = (validationSchema) => (req, res, next) => {
  const validationResult = validationSchema.validate(req.body, {
    convert: false, // to prevent Joi from converting the data type
    errors: { wrap: { label: "" } }, // to prevent Joi from wrapping the error message
    stripUnknown: true, // to remove unknown fields from the request body
  });
  if (validationResult.error) {
    let errMessage = validationResult.error.details[0].message;
    return next(new ErrorHandler(errMessage, 400));
  } else {
    next();
  }
};

const reqQueryValidator = (validationSchema) => (req, res, next) => {
  const validationResult = validationSchema.validate(req.query, {
    convert: false, // to prevent Joi from converting the data type
    errors: { wrap: { label: "" } }, // to prevent Joi from wrapping the error message
    stripUnknown: true, // to remove unknown fields from the request body
  });
  if (validationResult.error) {
    errMessage = validationResult.error.details[0].message;
    return next(new ErrorHandler(errMessage, 400));
  } else {
    next();
  }
};

const reqParamsValidator = (validationSchema) => (req, res, next) => {
  const validationResult = validationSchema.validate(req.params, {
    convert: false, // to prevent Joi from converting the data type
    errors: { wrap: { label: "" } }, // to prevent Joi from wrapping the error message
    stripUnknown: true, // to remove unknown fields from the request body
  });
  if (validationResult.error) {
    errMessage = validationResult.error.details[0].message;
    return next(new ErrorHandler(errMessage, 400));
  } else {
    next();
  }
};

export { reqBodyValidator, reqQueryValidator, reqParamsValidator }; 