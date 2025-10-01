import React, { useState } from "react";
import { Button, PasswordInput, Input } from "../components/ui";
import Card from "../components/ui/Card";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { tostMessage } from "../components/toastMessage";
import { useChangePasswordApi } from "../hooks/useUserApi";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {changePassword, isChangingPasswordPending, isChangingPasswordError, changingPasswordError} = useChangePasswordApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = {
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }

    changePassword(data)
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaLock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your current password and choose a new one
          </p>
        </div>

        <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                required
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                helperText="Password must be at least 6 characters long"
                required
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaCheckCircle className="w-4 h-4 text-green-500" />
                <span>Password must be at least 6 characters long</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaCheckCircle className="w-4 h-4 text-green-500" />
                <span>New password must be different from current password</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isChangingPasswordPending}
                disabled={isChangingPasswordPending}
                className="w-full"
              >
                {isChangingPasswordPending ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </div>
        </Card>
    </div>
  );
};

export default ChangePassword;
