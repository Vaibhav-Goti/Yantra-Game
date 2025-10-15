import Machine from "../modals/machine.modal.js";
import catchAsyncError from "./catchAsyncError.js";
import crypto from 'crypto';
import ErrorHandler from "../utils/errorHandler.js";

export default catchAsyncError(async (req, res, next) => {
    const requestSignature = req.headers['x-signature'];
    const machineId = req.headers['x-machine-id'];
    const timestamp = req.headers['x-timestamp'];
    const payload = JSON.stringify(req.body);

    const machine = await Machine.findOne({ _id: machineId });
    if (!machine) return next(new ErrorHandler('Machine not found!', 400));

    const secretKey = machine.secretKey;
    const signature = crypto.createHmac('sha256', secretKey).update(timestamp + payload).digest('hex');
    const isValidSignature = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(requestSignature, 'hex'));

    if (!isValidSignature) return next(new ErrorHandler('Invalid signature!', 401));
    next();
});