# Forgot Password Functionality Setup Guide

This guide explains how to set up and use the forgot password functionality in your gaming app.

## Backend Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000
```

### 2. Email Configuration

The system uses Gmail by default. To set up email functionality:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASS` in your `.env` file

### 3. Database Changes

The user model has been updated with the following fields:
- `resetPasswordToken`: Stores the reset token
- `resetPasswordExpires`: Stores the expiration time (1 hour)

## API Endpoints

### 1. Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "success": true, "message": "Password reset email sent successfully!" }`

### 2. Reset Password
- **Endpoint**: `POST /auth/reset-password`
- **Body**: `{ "token": "reset_token", "newPassword": "new_password" }`
- **Response**: `{ "success": true, "message": "Password reset successfully!" }`

## Frontend Pages

### 1. Forgot Password Page (`/forgot-password`)
- User enters their email address
- System sends reset email
- Shows confirmation message

### 2. Reset Password Page (`/reset-password?token=...`)
- User enters new password
- Validates password requirements
- Confirms password reset

### 3. Updated Login Page
- Added "Forgot Password?" link
- Links to forgot password page

## Password Requirements

The system enforces strong password requirements:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

## Security Features

1. **Token Expiration**: Reset tokens expire after 1 hour
2. **One-time Use**: Tokens are invalidated after successful password reset
3. **Email Validation**: Only valid email addresses can request password reset
4. **Secure Password Hashing**: Passwords are hashed using bcrypt

## Usage Flow

1. **User clicks "Forgot Password?"** on login page
2. **User enters email** on forgot password page
3. **System sends reset email** with secure link
4. **User clicks link** in email (valid for 1 hour)
5. **User enters new password** on reset page
6. **System updates password** and sends confirmation email
7. **User can login** with new password

## Error Handling

The system handles various error scenarios:
- Invalid email addresses
- Expired reset tokens
- Invalid reset tokens
- Email sending failures
- Password validation errors

## Testing

To test the functionality:

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd adminDashboard
   npm run dev
   ```

3. **Test the flow**:
   - Go to `/login`
   - Click "Forgot Password?"
   - Enter a valid email
   - Check your email for the reset link
   - Click the link and reset your password

## Troubleshooting

### Common Issues:

1. **Email not sending**:
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Ensure 2FA is enabled and app password is correct
   - Check Gmail security settings

2. **Reset link not working**:
   - Check FRONTEND_URL in .env
   - Ensure the frontend is running on the correct port
   - Verify the token hasn't expired (1 hour limit)

3. **Password validation errors**:
   - Ensure password meets all requirements
   - Check for special characters in password

## Dependencies Added

- `nodemailer`: For sending emails
- `crypto`: For generating secure reset tokens (built-in Node.js module)

## Files Modified/Created

### Backend:
- `backend/modals/user.modal.js` - Added reset token fields
- `backend/controllers/auth.contoller.js` - Added forgot/reset password logic
- `backend/utils/emailUtils.js` - Email sending functionality
- `backend/validations/user.validation.js` - Added validation schemas
- `backend/routers/auth.router.js` - Added new routes

### Frontend:
- `adminDashboard/src/pages/ForgotPassword.jsx` - Forgot password page
- `adminDashboard/src/pages/ResetPassword.jsx` - Reset password page
- `adminDashboard/src/pages/LoginPage.jsx` - Added forgot password link
- `adminDashboard/src/App.jsx` - Added new routes

The forgot password functionality is now fully implemented and ready to use!
