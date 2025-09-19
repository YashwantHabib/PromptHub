import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Toast from "../components/ui/toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [toast, setToast] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  function DotsLoader() {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

        if (error) {
          showToast(error.message, "error");
        } else if (data?.user && data.user.identities?.length === 0) {
          showToast("Account already exists with this email ❌", "error");
        } else {
          const userId = data.user?.id;
          if (userId) {
            const { error: insertError } = await supabase
              .from("users")
              .insert([{ id: userId, name }]);

            if (insertError) {
              console.error("Error inserting user:", insertError.message);
            }
          }
          showToast("Check your email to confirm your account 📩", "success");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          showToast("Invalid credentials ❌", "error");
        } else {
          showToast("Logged in successfully 🎉", "success");
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-black p-6 md:p-8 rounded-2xl shadow-[6px_6px_0px_black] w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {isSignUp && (
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-black text-black placeholder-gray-700 bg-white focus:outline-none focus-visible:ring-0 focus:border-black"
            required
          />
        )}

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-black text-black placeholder-gray-700 bg-white focus:outline-none focus-visible:ring-0 focus:border-black"
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-black text-black placeholder-gray-700 bg-white focus:outline-none focus-visible:ring-0 focus:border-black"
          required
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="border-2 border-black bg-pink-400 hover:shadow-[4px_4px_0px_black] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <DotsLoader /> : isSignUp ? "Sign Up" : "Log In"}
        </Button>

        <p
          className="text-sm text-center text-green-400 cursor-pointer underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don’t have an account? Sign up"}
        </p>
      </form>
    </div>
  );
}
