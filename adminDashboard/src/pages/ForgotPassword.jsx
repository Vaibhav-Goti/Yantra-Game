import React, { useState, useEffect } from "react";
import { Button, Input } from "../components/ui";
import { Link } from "react-router-dom";
import { useForgotPasswordApi } from "../hooks/useUserApi";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const {forgotPassword, isForgotPasswordPending, isForgotPasswordError, forgotPasswordError, isForgotPasswordSuccess} = useForgotPasswordApi()

  // Handle success state
  useEffect(() => {
    if (isForgotPasswordSuccess) {
      setEmailSent(true);
    }
  }, [isForgotPasswordSuccess]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    forgotPassword(formData)
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please check your email and click the link to reset your password. The link will expire in 1 hour.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              size="md"
              className="w-full"
            >
              Try Different Email
            </Button>
            <Link to="/login">
              <Button variant="primary" size="md" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isForgotPasswordPending}
            disabled={isForgotPasswordPending}
            className="w-full"
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
