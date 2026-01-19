import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isPasswordMatch = formData.password === formData.confirmPassword;
  const isFormValid = 
    formData.fullname && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    isPasswordMatch;

  function handleData(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const api = "http://localhost:5000/api/signup";

  async function handleForm(e) {
    e.preventDefault();

    if (!isPasswordMatch) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(api, {
        method: "POST", 
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      toast.success(result.message || "Signup Successful!");
      
      
      setFormData({ fullname: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  }

  return (
    <div className="w-full h-screen bg-[url(/bg1.jpg)] bg-cover bg-center flex justify-center items-center">
      
      <Toaster/>

      <form
        onSubmit={handleForm}
        className="w-[90%] max-w-125 bg-[#2323237b] backdrop-blur-md shadow-2xl shadow-violet-500/50 flex flex-col items-center justify-center gap-6 p-8 rounded-3xl border border-white/30"
      >
        <h1 className="text-white text-3xl font-bold text-center">
          Signup to <span className="text-[#66f5d9]">Continue</span>
        </h1>

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullname}
          name="fullname"
          onChange={handleData}
          className="w-full h-12 text-white bg-black/40 px-6 text-lg rounded-full border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-gray-400"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email ID"
          value={formData.email}
          name="email"
          onChange={handleData}
          className="w-full h-12 text-white bg-black/40 px-6 text-lg rounded-full border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-gray-400"
        />

        {/* Password */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            name="password"
            minLength={4}
            onChange={handleData}
            className="w-full h-12 text-white bg-black/40 px-6 pr-12 text-lg rounded-full border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-gray-400"
          />
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl cursor-pointer hover:text-violet-400 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            name="confirmPassword"
            onChange={handleData}
            className={`w-full h-12 text-white bg-black/40 px-6 pr-12 text-lg rounded-full border focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 
              ${
                formData.confirmPassword && !isPasswordMatch
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
                  : "border-white/20 focus:border-violet-500 focus:ring-violet-500/50"
              }`}
          />
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl cursor-pointer hover:text-violet-400 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
          </div>
        </div>

        {/* Error Message Area */}
        <div className="w-full min-h-6">
          {formData.confirmPassword && !isPasswordMatch && (
            <p className="text-red-400 text-sm text-center font-medium animate-pulse">
              Passwords do not match!
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          disabled={!isFormValid}
          className={`w-1/2 h-12 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg
            ${
              !isFormValid
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-linear-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 hover:scale-105 hover:shadow-red-500/30"
            }`}
        >
          Signup
        </button>

        <p className="text-gray-300 text-center">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-red-500 font-semibold hover:text-red-400 hover:underline transition-all"
          >
            Login
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Signup;