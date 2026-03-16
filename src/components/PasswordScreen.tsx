"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => void;
};

export default function PasswordScreen({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      localStorage.setItem("authenticated", "true");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-xs ${shake ? "animate-shake" : ""}`}
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Wishboard
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          パスワードを入力してください
        </p>
        <input
          type="password"
          inputMode="numeric"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="••••"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:border-gray-500 transition"
        />
        {error && (
          <p className="text-red-500 text-xs text-center mt-2">
            パスワードが違います
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-4 py-3 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
