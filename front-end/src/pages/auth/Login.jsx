import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from '../../assets/logo.png';
import api from "../../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ identifier: location.state?.email || "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        identifier: form.identifier.trim(),
        password: form.password,
      });

      if (response.data?.success) {
        const { user, token } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8">
        <img src={logo} alt="Logo" className="w-24 h-24 mb-2" />
        <h1 className="text-4xl font-bold text-[#055E83]">Siem Reap Bannalay</h1>
        <p className="text-[#64748B] mt-1 text-sm tracking-wide">Library Management System</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-full max-w-lg p-10">
        <h2 className="text-2xl font-bold text-[#055E83] mb-1">Welcome back</h2>
        <p className="text-[#64748B] text-sm mb-7">Sign in to your admin or librarian account to continue.</p>

        {location.state?.registered && (
          <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Account created successfully. Sign in below to continue.</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Library ID / Email */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-[#055E83] mb-1.5">
              Library ID / Email
            </label>
            <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
              <Mail size={16} className="text-[#055E83] shrink-0" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter your ID or email"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#055E83]">Password</label>
              <a href="#" className="text-sm text-[#64748B] font-medium hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
              <Lock size={16} className="text-[#055E83] shrink-0" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#64748B] hover:text-[#1E293B]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#055E83] rounded"
            />
            <label htmlFor="remember" className="text-sm text-[#64748B]">
              Remember me for 30 days
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8C110] hover:opacity-90 text-[#055E83] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"} {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#64748B] mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#055E83] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}