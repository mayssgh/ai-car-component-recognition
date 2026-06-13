import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase/client";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/tabs/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#122b2f] text-[#e5e2dd] px-4 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 blur-[100px] rounded-full"></div>

      {/* Main Container */}
      <main className="w-full max-w-[440px] z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2d4c4e] mb-4 border border-white/10">
            <span className="text-blue-400 text-4xl">📷</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-2">
            BakoVision
          </h1>

          <p className="text-gray-300 font-medium">
            AI Component Intelligence
          </p>
        </div>

        {/* Login Card */}
        <section className="backdrop-blur-xl bg-[#2d4c4e]/40 border border-white/10 rounded-2xl p-8 shadow-2xl">

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs tracking-wider text-gray-300 mb-2">
                WORK EMAIL
              </label>

              <input
                type="email"
                placeholder="engineer@bakovision.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2d4c4e] border border-gray-500/20 text-[#d4d1cc] rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs tracking-wider text-gray-300">
                  SECURITY KEY
                </label>

                <button
                  type="button"
                  className="text-blue-400 text-xs hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#2d4c4e] border border-gray-500/20 text-[#d4d1cc] rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Remember */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4"
              />

              <label
                htmlFor="remember"
                className="ml-2 text-sm text-gray-300"
              >
                Stay authenticated on this terminal
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2a5fab] hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>

            <div className="relative flex justify-center">
              <span className="bg-[#122b2f] px-4 text-xs text-gray-400">
                OR CONNECT VIA
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">

            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-[#2d4c4e]/50 hover:bg-[#2d4c4e] transition-colors">
              Google
            </button>

            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-[#2d4c4e]/50 hover:bg-[#2d4c4e] transition-colors">
              Apple
            </button>

          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Authorized access only. Technical monitoring in effect.
            <br />
            v4.0.2-Stable • System Status:
            <span className="text-green-400 ml-1">
              Operational
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}