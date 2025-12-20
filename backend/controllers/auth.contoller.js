import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../modals/user.modal.js";
import ErrorHandler from "../utils/errorHandler.js";
import { hashPassword, verifyHashPassword } from "../utils/passwordUtils.js";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/tokenUtils.js";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../utils/emailUtils.js";
import crypto from 'crypto';
import Session from "../modals/session.modal.js";

const hashRefreshToken = (refreshToken) => {
    return crypto.createHash('sha256').update(refreshToken).digest('hex')
}

// Set refresh token as httpOnly cookie (secure, not accessible via JavaScript)
const cookieOptions = {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'none', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Available for all routes
}

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

    // Increment token version to invalidate all previous tokens
    // isUser.tokenVersion = (isUser.tokenVersion || 0) + 1

    // Generate new tokens
    const token = generateToken({ id: isUser._id }, '15m')
    const refreshToken = generateRefreshToken()
    const refreshTokenHashed = hashRefreshToken(refreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Store new refresh token (this invalidates previous sessions)
    // isUser.refreshToken = refreshToken
    // isUser.expiresAt = expiresAt
    // await isUser.save()
    const session = new Session({
        userId: isUser._id,
        refreshTokenHashed: refreshTokenHashed,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceInfo: req.headers['sec-ch-ua-platform'] || 'unknown',
        expiresAt: expiresAt
    })
    await session.save()

    res.cookie('refreshToken', refreshToken, cookieOptions)

    res.status(200).json({
        success: true,
        message: 'Login Successfully!',
        data: user,
        token
        // Don't return refreshToken in response body - it's in httpOnly cookie
    })
})

export const refreshToken = catchAsyncError(async (req, res, next) => {
    // Get refresh token from httpOnly cookie instead of request body
    const refreshToken = req.cookies?.refreshToken
    console.log(req.cookies)
    console.log(refreshToken)
    
    if (!refreshToken) {
        return next(new ErrorHandler('Refresh token is required!', 400))
    }
    const refreshTokenHashed = hashRefreshToken(refreshToken)

    try {
        const session = await Session.findOne({ refreshTokenHashed: refreshTokenHashed })
        // if (!session) {
        //     return next(new ErrorHandler('Invalid or expired refresh token!', 401))
        // }

        if(!session || session.revoked || session.expiresAt < new Date()) {
            if (session?.userId) {
                await Session.updateMany(
                  { userId: session.userId },
                  { revoked: true }
                )
              }
            return next(new ErrorHandler('Invalid or expired refresh token!', 401))
        }

        const newToken = generateToken({ id: session.userId }, '15m')
        const newRefreshToken = generateRefreshToken()
        const newRefreshTokenHashed = hashRefreshToken(newRefreshToken)

        session.revoked = true
        session.replacedByToken = refreshTokenHashed
        await session.save()

        const newSession = new Session({
            userId: session.userId,
            refreshTokenHashed: newRefreshTokenHashed,
            userAgent: session.userAgent,
            ipAddress: session.ipAddress,
            deviceInfo: session.deviceInfo,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        await newSession.save()

        res.cookie('refreshToken', newRefreshToken, cookieOptions)
        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully!',
            token: newToken
        })
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired refresh token!', 401))
    }
})

export const logout = catchAsyncError(async (req, res, next) => {
    try {
        // Get refresh token from httpOnly cookie
        const refreshToken = req.cookies?.refreshToken

        if (refreshToken) {
            try {
                const decoded = hashRefreshToken(refreshToken)
                const session = await Session.findOne({ refreshTokenHashed: decoded })
                if (session) {
                    session.revoked = true
                    await session.save()
                }
            } catch (error) {
                // If token is invalid, just clear the cookie
                console.log('Error during logout token verification:', error.message)
            }
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken', cookieOptions)

        return res.status(200).json({
            success: true,
            message: 'Logout successful!'
        })
    } catch (error) {
        console.log('Error during logout:', error.message)
        // Clear cookie even if there's an error
        res.clearCookie('refreshToken', cookieOptions)
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

    // Invalidate all other sessions
    await Session.updateMany(
        { userId: userId },
        { revoked: true }
    )

    user.password = newPassword
    await user.save()

    // Generate new token so user can continue their session
    const newToken = generateToken({ id: user._id }, '15m')
    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenHashed = hashRefreshToken(newRefreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const newSession = new Session({
        userId: user._id,
        refreshTokenHashed: newRefreshTokenHashed,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceInfo: req.headers['sec-ch-ua-platform'] || 'unknown',
        expiresAt: expiresAt
    })
    await newSession.save()

    res.cookie('refreshToken', newRefreshToken, cookieOptions)
    res.status(200).json({
        success: true,
        message: 'Password changed successfully!',
        token: newToken
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

    // Update password and invalidate all existing sessions
    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    try {
        // Send confirmation email
        await sendPasswordResetConfirmation(user.email)
    } catch (error) {
        // console.log('Failed to send confirmation email:', error.message)
        return next(new ErrorHandler('Failed to send confirmation email. Please try again.', 500))
        // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
        success: true,
        message: 'Password reset successfully!'
    })
})