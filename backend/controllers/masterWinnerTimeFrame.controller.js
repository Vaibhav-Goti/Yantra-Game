import MasterWinnerTimeFrame from "../modals/masterWinnerTimeFrame.modal";
import { formatDate, formatTimeToHHMM, isValidateTimeFormat, validateDateFormat } from "../utils/timeUtils";

export const createMasterWinnerTimeFrame = catchAsyncError(async (req, res, next) => {
    const { time, date, percentage, machineId } = req.body;

    const validateTime = isValidateTimeFormat(time);
    const validateDate = validateDateFormat(date);
    let formattedTime = time;
    let formattedDate = date;
    if (!validateTime) {
        formattedTime = formatTimeToHHMM(time);
    }
    if (!validateDate) {
        formattedDate = formatDate(date);
    }

    const masterWinnerTimeFrame = new MasterWinnerTimeFrame({ time: formattedTime, date: formattedDate, percentage, machineId });
    // await masterWinnerTimeFrame.save();

    res.status(201).json({
        success: true,
        message: 'Master winner time frame created successfully',
        data: masterWinnerTimeFrame
    });
});