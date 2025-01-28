"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";
import { apiHelper } from '../../../Services/index'
import { HTTPVERBS } from "@/utils/HTTPVERBS";
import { useDispatch } from "react-redux";
import { Signin } from "@/store/slices";

const SignIn: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (prop: any) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = { email: values.email, password: values.password };
    const { response, error } = await apiHelper(HTTPVERBS.POST, "admin/login", null, body);
    if (response) {
      setLoading(false);
      const token = response?.data?.response?.data?.accessToken;
      const userData = response?.data;
      dispatch(Signin(userData));
      Cookies.set('token', token, { expires: 10 });
      enqueueSnackbar(response.data.message, { variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      router.replace('/');
    } else {
      setLoading(false);
      enqueueSnackbar("Invalid email or password", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPass = () => {
    setShowModal(true);
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      const response = await apiHelper(HTTPVERBS.POST, "admin/forgot-password", null, { email: forgotEmail });
      if (response) {
        enqueueSnackbar("Password reset email sent!", { variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        setShowModal(false);
        setShowOtpModal(true);
      } else {
        enqueueSnackbar("Failed to send reset email. Please try again.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      }
    } catch (err) {
      enqueueSnackbar("Error sending reset email.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    try {
      const response = await apiHelper(HTTPVERBS.POST, "admin/reset/verify-otp", null, { otp: otpCode });
      if (response) {
        enqueueSnackbar("OTP verified successfully!", { variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        setShowOtpModal(false);
      } else {
        enqueueSnackbar("Invalid OTP. Please try again.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      }
    } catch (err) {
      enqueueSnackbar("Error verifying OTP.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  const handleResendOtpClick = () => {
    setShowOtpModal(false); 
    setShowEmailModal(true); 
  };

  const handleResendOtp = async () => {
    if (!forgotEmail) {
      enqueueSnackbar("Please enter your email first.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      return;
    }
    try {
      const response = await apiHelper(HTTPVERBS.POST, "admin/reset/resend-otp", null, { email: forgotEmail });
      if (response) {
        enqueueSnackbar("OTP resent successfully!", { variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        setShowEmailModal(false); 
        setShowOtpModal(true); 
      } else {
        enqueueSnackbar("Failed to resend OTP. Please try again.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      }
    } catch (err) {
      enqueueSnackbar("Error resending OTP.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  const handleResetPassword = async () => {
    const { email, otp, newPassword, confirmPassword } = resetPasswordData;
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Passwords do not match.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      return;
    }
    if (!otp || otp.length === 0) {
      enqueueSnackbar("OTP is required.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      return;
    }
    if (!newPassword || !confirmPassword) {
      enqueueSnackbar("Both password fields are required.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      return;
    }
    try {
      const response = await apiHelper(HTTPVERBS.POST, "admin/reset-password", null, { 
        email, 
        code: otp, 
        password: newPassword,
        confirm_password: confirmPassword
      });
      if (response) {
        enqueueSnackbar("Password reset successfully!", { variant: 'success', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
        setShowResetPasswordModal(false);
      } else {
        console.error("API Response:", response);
        enqueueSnackbar("Failed to reset password. Please try again.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
      }
    } catch (err) {
      console.error("API Error:", err);
      enqueueSnackbar("Error resetting password.", { variant: 'error', anchorOrigin: { vertical: 'bottom', horizontal: 'right' } });
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          {/* <div className="hidden w-full xl:block xl:w-1/2"> */}
            {/* <div className="px-26 py-17.5 text-center">
              <Link href="/" className="mb-5.5 inline-block">
                <Image
                  className="dark:hidden"
                  src={"/images/DeerImg.png"}
                  alt="Logo"
                  width={686}
                  height={92}
                />
              </Link>
            </div> */}
          {/* </div> */}
          {/* <div className="w-full xl:w-1/2">  */}
            <div className="px-[20%] py-[10] w-[80%] mt-40 ml-40">
              <div className="border-2 bg-container-500 p-6 border-gray-300 rounded-lg">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 items-center flex justify-center">
                Sign In to Hunt and Hull
              </h2>
              <form onSubmit={handleSignIn}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-bold">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className='w-full rounded-lg border-2 border-lightGray bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-gray-600 dark:bg-form-input dark:text-white dark:focus:border-primary'
                    value={values.email}
                    onChange={handleChange('email')}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-bold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className='w-full rounded-lg border-2 border-lightGray bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-gray-600 dark:bg-form-input dark:text-white dark:focus:border-primary relative'
                      value={values.password}
                      onChange={handleChange('password')}
                      required
                    />
                    <span
                      className=" right-[20px] top-[15px] cursor-pointer text-gray-500 dark:text-gray-400 absolute"
                      onClick={togglePasswordVisibility}>
                      <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </span>
                  </div>
                </div>
                <div onClick={handleForgotPass} className="mt-5 mb-2">
                  <h4 className="underline cursor-pointer">Forgot Password?</h4>
                </div>
                <div onClick={() => setShowResetPasswordModal(true)} className="mt-2 mb-2">
                  <h4 className="underline cursor-pointer ">Reset Password</h4>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                  disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                {/* <div className="mt-6 text-center">
                  <p>
                    Don’t have any account?{" "}
                    <Link href="/auth/signup" className="text-primary">
                      Sign Up
                    </Link>
                  </p>
                </div> */}
              </form>
              </div>
            </div>
          {/* </div> */}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Enter email for Otp Code</h3>
            <input
              type="email"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Your email address"
            />
            <button
              onClick={handleForgotPasswordSubmit}
              className="w-full bg-primary text-white p-3 rounded-lg">
              Send
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 p-3 text-center text-gray-500">
              Close
            </button>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Enter your Email for OTP</h3>
            <input
              type="email"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Your email address"
            />
            <button
              onClick={handleResendOtp}
              className="w-full bg-primary text-white p-3 rounded-lg">
              Resend OTP
            </button>
            <button
              onClick={() => setShowEmailModal(false)}
              className="w-full mt-2 p-3 text-center text-gray-500">
              Close
            </button>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Enter OTP</h3>
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg"
                />
              ))}
            </div>
            <div className="mt-2 mb-2">
              <h4
                onClick={handleResendOtpClick}
                className="underline cursor-pointer">Resend Otp</h4>
            </div>
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-primary text-white p-3 rounded-lg mt-4">
              Verify OTP
            </button>
            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-2 p-3 text-center text-gray-500">
              Close
            </button>
          </div>
        </div>
      )}
      {showResetPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Reset Password</h3>
            <input
              type="email"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={resetPasswordData.email}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
              placeholder="Your email address"
            />
            <input
              type="number"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={resetPasswordData.otp}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, otp: e.target.value })}
              placeholder="OTP"
            />
            <input
              type="password"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={resetPasswordData.newPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
              placeholder="New Password"
            />
            <input
              type="password"
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
              value={resetPasswordData.confirmPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
            />
            <button
              onClick={handleResetPassword}
              className="w-full bg-primary text-white p-3 rounded-lg">
              Reset Password
            </button>
            <button
              onClick={() => setShowResetPasswordModal(false)}
              className="w-full mt-2 p-3 text-center text-gray-500">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;


