import User from "../modals/user.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import { verifyToken } from "../utils/tokenUtils.js";
import catchAsyncError from "./catchAsyncError.js";

export default catchAsyncError(async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler('Authentication token is missing or invalid', 401));
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = verifyToken(token)

        const user = await User.findOne({_id: decoded.id});
        if (!user) {
            return next(new ErrorHandler('Access Denied! You are not register. Please register first!', 401));
        }

        const userData = user.toObject()
        delete userData.password;
        delete userData.refreshToken;

        req.user = userData;
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
});