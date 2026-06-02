import { useState } from "react";
import { User, Calendar, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend
    console.log("Register:", form);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-start px-4 py-12">

      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-bold text-[#055E83]">Create Library Account</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Join the Siem Reap Bannalay admin system. Fill in your details to get started.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-full max-w-2xl p-10 space-y-8">

        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-[#055E83] flex items-center gap-2 mb-6">
            <User size={18} /> Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#055E83] mb-1.5">Full Name</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <User size={15} className="text-[#055E83] shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your full legal name"
                  value={form.fullName}
                  onChange={update("fullName")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-[#055E83] mb-1.5">Date of Birth</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <Calendar size={15} className="text-[#055E83] shrink-0" />
                <input
                  type="date"
                  value={form.dob}
                  onChange={update("dob")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-[#055E83] mb-1.5">Gender</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <select
                  value={form.gender}
                  onChange={update("gender")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent appearance-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown size={15} className="text-[#055E83] shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#055E83] mb-1.5">Phone Number</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <Phone size={15} className="text-[#055E83] shrink-0" />
                <input
                  type="tel"
                  placeholder="+855 xx xxx xxxx"
                  value={form.phone}
                  onChange={update("phone")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E2E8F0]" />

        {/* Account Credentials */}
        <div>
          <h2 className="text-lg font-semibold text-[#055E83] flex items-center gap-2 mb-6">
            <Lock size={18} /> Account Credentials
          </h2>

          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#055E83] mb-1.5">
                Library ID / Email Address
              </label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <Mail size={15} className="text-[#055E83] shrink-0" />
                <input
                  type="email"
                  placeholder="id@bannalay.edu.kh"
                  value={form.email}
                  onChange={update("email")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#055E83] mb-1.5">Password</label>
                <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                  <Lock size={15} className="text-[#055E83] shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={update("password")}
                    className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#64748B] hover:text-[#1E293B]">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#055E83] mb-1.5">Confirm Password</label>
                <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                  <Lock size={15} className="text-[#055E83] shrink-0" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#64748B] hover:text-[#1E293B]">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#64748B]">or register with</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          className="w-full border border-[#CBD5E1] bg-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-[#1E293B] hover:bg-gray-50 transition"
        >
          <span className="text-blue-500 font-bold text-base">G</span>
          Register with Google
        </button>

        {/* Create Account Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#E8C110] hover:opacity-90 text-[#055E83] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
        >
          Create Account <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-[#64748B] flex gap-4">
        <span>© 2024 Siem Reap Bannalay</span>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Help Center</a>
      </div>

      {/* Sign In Link */}
      <p className="text-sm text-[#64748B] mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-[#055E83] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}