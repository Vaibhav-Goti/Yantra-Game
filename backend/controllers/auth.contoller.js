import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../modals/user.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import { hashPassword, verifyHashPassword } from "../utils/passwordUtils.js";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/tokenUtils.js";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../utils/emailUtils.js";
import crypto from 'crypto';

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body
    // console.log(email, password)

    const isUser = await User.findOne({ email })

    if (!isUser) return next(new ErrorHandler('User not found!', 400));

    const user = isUser.toObject()
    delete user.password
    delete user.refreshToken
    delete user.expiresAt

    
    const isPasswordMatch = await verifyHashPassword(password, isUser.password)

    if (!isPasswordMatch) return next(new ErrorHandler('Invalid Password!', 400))

    // Generate new tokens
    const token = generateToken({ id: isUser._id }, '15m')
    const refreshToken = generateRefreshToken()
    const refreshTokenHashed = generateToken({refreshToken}, '7d')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Store new refresh token (this invalidates previous sessions)
    isUser.refreshToken = refreshToken
    isUser.expiresAt = expiresAt
    await isUser.save()

    res.status(200).json({
        success: true,
        message: 'Login Successfully!',
        data: user,
        token,
        refreshToken: refreshTokenHashed // Return the raw refresh token, not the hashed one
    })
})

export const refreshToken = catchAsyncError(async (req, res, next) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return next(new ErrorHandler('Refresh token is required!', 400))
    }

    try {

        const decoded = verifyToken(refreshToken)
        if (!decoded) {
            return next(new ErrorHandler('Invalid or expired refresh token!', 401))
        }

        // Find all users and check if any has a matching hashed refresh token
        const users = await User.findOne({ 
            refreshToken: decoded.refreshToken,
            expiresAt: { $gt: new Date() }
        })

        if (!users) {
            return next(new ErrorHandler('Invalid or expired refresh token!', 401))
        }   

        // Generate new tokens
        const newToken = generateToken({ id: users._id }, '15m')
        const newRefreshToken = generateRefreshToken()
        const newRefreshTokenHashed = generateToken({refreshToken: newRefreshToken}, '7d')

        // Update user with new refresh token
        users.refreshToken = newRefreshToken
        users.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await users.save()

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully!',
            token: newToken,
            refreshToken: newRefreshTokenHashed // Return raw token, not hashed
        })
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired refresh token!', 401))
    }
})

export const logout = catchAsyncError(async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        
        if (!refreshToken) {
            return res.status(200).json({
                success: true,
                message: 'Logout successful!'
            })
        }

        // Find all users and check if any has a matching hashed refresh token
        const users = await User.find({ 
            refreshToken: { $ne: null }
        })

        let user = null
        for (const u of users) {
            const isMatch = await verifyHashPassword(refreshToken, u.refreshToken)
            if (isMatch) {
                user = u
                break
            }
        }

        if (user) {
            user.refreshToken = null
            user.expiresAt = null
            await user.save()
        }

        return res.status(200).json({
            success: true,
            message: 'Logout successful!'
        })
    } catch (error) {
        console.log('Error during logout:', error.message)
        return res.status(200).json({
            success: true,
            message: 'Logout successful!'
        })
    }
})

// change password
export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    // console.log(oldPassword, newPassword)
    const userId = req.user._id

    const user = await User.findById(userId)
    if (!user) return next(new ErrorHandler('User not found!', 400))

    const isPasswordMatch = await verifyHashPassword(oldPassword, user.password)
    if (!isPasswordMatch) return next(new ErrorHandler('Invalid Password!', 400))

    console.log('Before save - newPassword:', newPassword)
    user.password = newPassword
    await user.save()
    console.log('After save - user.password:', user.password)

    res.status(200).json({
        success: true,
        message: 'Password changed successfully!'
    })
})

// Forgot password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        return next(new ErrorHandler('User not found with this email!', 404))
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpires
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.FRONTENT_BASEURL}/reset-password?token=${resetToken}`

    try {
        // Send reset email
        await sendPasswordResetEmail(email, resetToken, resetUrl)

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully!'
        })
    } catch (error) {
        // Clear the reset token if email fails
        user.resetPasswordToken = null
        user.resetPasswordExpires = null
        await user.save()

        return next(new ErrorHandler('Failed to send reset email. Please try again.', 500))
    }
})

// Reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token, newPassword } = req.body

    // Find user with valid reset token
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
    })

    if (!user) {
        return next(new ErrorHandler('Invalid or expired reset token!', 400))
    }

    // Update password
    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    try {
        // Send confirmation email
        await sendPasswordResetConfirmation(user.email)
    } catch (error) {
        console.log('Failed to send confirmation email:', error.message)
        // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
        success: true,
        message: 'Password reset successfully!'
    })
})