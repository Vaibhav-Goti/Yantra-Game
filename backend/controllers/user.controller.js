import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../modals/user.modal.js";
import ErrorHandler from "../utils/errorHandler.js";

// create admin user
export const createUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password}  = req.body;

    const user = new User({
        name,
        email,
        password
    })

    await user.save()

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        message: 'User Registration successfully.',
        data: userResponse
    })
})

// get user profile
export const getProfile = catchAsyncError(async (req, res,next) => {
    const user = req.user;

    res.status(200).json({
        success: true,
        message: 'User profile fetched successfully!',
        data: user
    })
})

// update user profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const { name, email } = req.body;

    // Create update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new ErrorHandler('User nor found!', 400))
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        data: userResponse
    });
});

// delete user account
export const deleteAccount = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        return next(new ErrorHandler('User not found', 400));
    }

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully!'
    });
});

// get all users (admin only)
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const searchQuery = { role: 'Admin' };
    if (search) {
        searchQuery.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    
    // Get users with pagination and search
    const users = await User.find(searchQuery)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by newest first
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
        success: true,
        message: 'Users fetched successfully!',
        data: users,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
        }
    });
});

// update user by admin (admin only)
export const updateUser = catchAsyncError(async (req, res, next) => {
    const { userId, name, email } = req.body;

    if (!userId) {
        return next(new ErrorHandler('User ID is required', 400));
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return next(new ErrorHandler('Email already exists', 400));
        }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
        success: true,
        message: 'User updated successfully!',
        data: updatedUser
    });
});

// delete user by admin (admin only)
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.body;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'User deleted successfully!'
    });
});
