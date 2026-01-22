import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setToken } from "../app/slice/auth";
import { setUserData } from "../app/slice/user";
const Signin = () => {
  const navigate = useNavigate();
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  // console.log(token);
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Derived State (Calculate validity on the fly)
  const isFormValid = formData.email && formData.password;

  const api = "http://localhost:5000/api/login";

  function handleData(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleForm(e) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

      const loadingToast = toast.loading("loading");
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
        throw new Error(result.message || "Login failed");
      }
      localStorage.setItem('tokenc', result.token);
      localStorage.setItem('userc', JSON.stringify(result.user));
      dispatch(setToken(result.token));
      toast.success(result.message || "Login Successful!");

      // Clear form and redirect
      setFormData({ email: "", password: "" });
      dispatch(setUserData(result.user));

      // console.log(result);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      toast.dismiss(loadingToast);
    }
  }

  return (
    <div className="w-full h-screen bg-[url(/bg1.jpg)] bg-cover bg-center flex justify-center items-center">
      <Toaster position="top-center" reverseOrder={false} />

      <form
        onSubmit={handleForm}
        className="w-[90%] max-w-125 bg-[#2323237b] backdrop-blur-md shadow-2xl shadow-violet-500/50 flex flex-col items-center justify-center gap-8 p-8 rounded-3xl border border-white/10"
      >
        <h1 className="text-white text-3xl font-bold mb-4 text-center">
          SignIn to <span className="text-[#66f5d9]">Continue</span>
        </h1>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email ID"
          value={formData.email}
          name="email"
          onChange={handleData}
          className="w-full h-12 text-white bg-black/40 px-6 text-lg rounded-full border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-gray-400"
        />

        {/* Password Input */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            name="password"
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

        {/* Submit Button */}
        <button
          disabled={!isFormValid}
          className={`w-1/2 h-12 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg mt-4
            ${
              !isFormValid
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-linear-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 hover:scale-105 hover:shadow-red-500/30"
            }`}
        >
          SignIn
        </button>

        <p className="text-gray-300 text-center text-lg">
          Do not have an account?{" "}
          <NavLink
            to="/signup"
            className="text-red-500 font-semibold hover:text-red-400 hover:underline transition-all"
          >
            Register
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Signin;
