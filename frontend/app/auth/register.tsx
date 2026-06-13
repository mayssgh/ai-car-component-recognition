import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase/client";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#122b2f] text-[#e5e2dd] px-4 relative overflow-hidden">

      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>

        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="w-full max-w-[480px] z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 space-y-4">

          <div className="w-16 h-16 rounded-2xl bg-[#2a5fab] flex items-center justify-center shadow-[0_0_30px_rgba(42,95,171,0.3)]">
            <span className="text-white text-4xl">
              📷
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-1">
              BakoVision
            </h1>

            <p className="text-gray-300 tracking-wide">
              Next-gen Automotive Intelligence
            </p>
          </div>
        </div>

        {/* Registration Card */}
        <section className="backdrop-blur-xl bg-[#2d4c4e]/70 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">

          <header className="mb-8">
            <h2 className="text-3xl font-semibold">
              Initialize Account
            </h2>

            <p className="text-gray-300 mt-2">
              Enter your technical credentials to begin.
            </p>
          </header>

          <form
            onSubmit={handleRegister}
            className="space-y-6"
          >

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-300">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#2d4c4e]/50 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-300">
                Email Address
              </label>

              <input
                type="email"
                placeholder="engineer@bakovision.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2d4c4e]/50 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-300">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#2d4c4e]/50 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Confirm */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-300">
                  Confirm
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full bg-[#2d4c4e]/50 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2a5fab] hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 font-semibold"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center space-y-4">

            <p className="text-gray-300">
              Already part of the fleet?

              <button
                onClick={() => navigate("/auth/login")}
                className="text-blue-400 font-bold ml-2 hover:underline"
              >
                Log in
              </button>
            </p>

            <div className="flex items-center gap-4 text-gray-500">
              <span className="h-px w-8 bg-current"></span>

              <span className="text-xs tracking-wider">
                SECURE ENCRYPTED HANDSHAKE
              </span>

              <span className="h-px w-8 bg-current"></span>
            </div>

          </footer>
        </section>

        {/* Decorative Card */}
        <div className="mt-8 opacity-60 hover:opacity-100 transition-opacity duration-700">
          <div className="relative h-24 rounded-2xl overflow-hidden">

            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop"
              alt="Automotive AI"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#122b2f] to-transparent"></div>

            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>

              <span className="text-xs text-white tracking-wider">
                SYSTEM STATUS: READY FOR LINK
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}