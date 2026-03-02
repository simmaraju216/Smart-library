import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import libraryBg from "../../assets/images/librarypic.jpg";

const Login = () => {
  // PRODUCTION: Remove hardcoded demo credentials and initialize these as empty strings.
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("Admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (user.first_login) {
        navigate("/reset-password");
        return;
      }
      navigate(user.role === "admin" ? "/admin" : "/student");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${libraryBg})` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/60 to-black/70 backdrop-blur-sm"></div>

      {/* Glass Card */}
      <form
        onSubmit={submit}
        className="relative z-10 w-[420px] bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-10 text-white space-y-5 transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-wide">
            📚 Smart Library
          </h2>
          <p className="text-sm text-slate-200">
            “A reader lives a thousand lives before he dies.”
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-slate-200 text-white focus:outline-none focus:ring-2 focus:ring-white/60"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-slate-200 text-white focus:outline-none focus:ring-2 focus:ring-white/60 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center font-semibold">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:bg-slate-200 hover:shadow-xl transition-all duration-300"
        >
          Sign In
        </button>

        {/* Demo */}
        <p className="text-xs text-slate-300 text-center pt-2">
          Demo: admin@gmail.com / Admin123
        </p>

        {/* Footer Quote */}
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-xs text-slate-300 italic">
            “Knowledge is the passport to the future.”
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
