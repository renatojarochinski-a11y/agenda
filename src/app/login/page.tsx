"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = ["Renato", "Nicole"] as const;

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState<(typeof USERS)[number]>("Renato");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao entrar.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">🗓️</div>
          <h1 className="text-xl font-semibold text-neutral-800">
            Agenda Renato & Nicole
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Entre com o login compartilhado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Quem é você?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setName(u)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    name === u
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              Senha da família
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
