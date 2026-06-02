import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend
    console.log("Login:", form);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-4xl font-bold text-[#055E83]">Siem Reap Bannalay</h1>
        <p className="text-[#64748B] mt-1 text-sm tracking-wide">Library Management System</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-full max-w-lg p-10">
        <h2 className="text-2xl font-bold text-[#055E83] mb-1">Welcome back</h2>
        <p className="text-[#64748B] text-sm mb-7">Sign in to your admin or librarian account to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Library ID / Email */}
          <div>
            <label className="block text-sm font-medium text-[#055E83] mb-1.5">
              Library ID / Email
            </label>
            <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
              <Mail size={16} className="text-[#055E83] shrink-0" />
              <input
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
              <label className="text-sm font-medium text-[#055E83]">Password</label>
              <a href="#" className="text-sm text-[#64748B] font-medium hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
              <Lock size={16} className="text-[#055E83] shrink-0" />
              <input
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
            className="w-full bg-[#E8C110] hover:opacity-90 text-[#055E83] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            Sign In <ArrowRight size={18} />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-xs text-[#64748B]">or continue with</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full border border-[#CBD5E1] bg-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#1E293B] hover:bg-gray-50 transition"
          >
            <span className="text-blue-500 font-bold text-base">G</span>
            Sign in with Google
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