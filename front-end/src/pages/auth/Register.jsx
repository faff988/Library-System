import { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    if (!firstName || !lastName || !form.email.trim() || !form.password) {
      setError("Please fill in your first name, last name, email, and password.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
      });

      if (response.data?.success) {
        // Account is created but we deliberately don't log the user in here -
        // send them to Login.jsx instead, which reads this state to show a
        // "registered successfully" banner and pre-fill the email field.
        navigate("/login", { state: { registered: true, email: form.email.trim() } });
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] w-full max-w-2xl p-10 space-y-8">

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-[#055E83] flex items-center gap-2 mb-6">
            <User size={18} /> Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#055E83] mb-1.5">First Name</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <User size={15} className="text-[#055E83] shrink-0" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="e.g. Sokha"
                  value={form.firstName}
                  onChange={update("firstName")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#055E83] mb-1.5">Last Name</label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <User size={15} className="text-[#055E83] shrink-0" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="e.g. Chen"
                  value={form.lastName}
                  onChange={update("lastName")}
                  className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
                />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="mt-5">
            <label htmlFor="phone" className="block text-sm font-medium text-[#055E83] mb-1.5">Phone Number (Optional)</label>
            <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
              <Phone size={15} className="text-[#055E83] shrink-0" />
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+855 xx xxx xxxx"
                value={form.phone}
                onChange={update("phone")}
                className="flex-1 text-sm outline-none text-[#1E293B] bg-transparent placeholder-[#64748B]"
              />
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
              <label htmlFor="email" className="block text-sm font-medium text-[#055E83] mb-1.5">
                Library ID / Email Address
              </label>
              <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                <Mail size={15} className="text-[#055E83] shrink-0" />
                <input
                  id="email"
                  name="email"
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
                <label htmlFor="password" className="block text-sm font-medium text-[#055E83] mb-1.5">Password</label>
                <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                  <Lock size={15} className="text-[#055E83] shrink-0" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#055E83] mb-1.5">Confirm Password</label>
                <div className="flex items-center bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl px-4 py-3 gap-3 focus-within:border-[#055E83] transition">
                  <Lock size={15} className="text-[#055E83] shrink-0" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
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

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8C110] hover:opacity-90 text-[#055E83] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"} {!loading && <ArrowRight size={18} />}
        </button>
      </form>

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