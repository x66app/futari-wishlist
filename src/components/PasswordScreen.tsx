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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          パスワードを入力
        </h1>
        <div className={shake ? "animate-shake" : ""}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="0000"
            className="w-48 text-center text-2xl tracking-widest border-b-2 border-gray-300 focus:border-gray-800 outline-none bg-transparent py-2 text-gray-800"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-3">パスワードが違うよ</p>
        )}
        <button
          type="submit"
          className="mt-8 px-8 py-3 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition"
        >
          入る
        </button>
      </form>
    </div>
  );
}
