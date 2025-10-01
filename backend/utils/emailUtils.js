import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true, 
        port: 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - Gaming App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You have requested to reset your password for your Gaming App account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Gaming App. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        // console.log('mailOptions', mailOptions);
        const result = await transporter.sendMail(mailOptions);
        // console.log('Password reset email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        // console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Successful - Gaming App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Password Reset Successful</h2>
                    <p>Hello,</p>
                    <p>Your password has been successfully reset for your Gaming App account.</p>
                    <p>If you did not make this change, please contact support immediately.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Gaming App. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        // console.log('Password reset confirmation email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        // console.error('Error sending password reset confirmation email:', error);
        throw new Error('Failed to send password reset confirmation email');
    }
};
