"use client";

import { useEffect, useState } from "react";

export default function MLCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Processando autorização...");

  useEffect(() => {
    async function run() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage(`Erro recebido do Mercado Livre: ${error}`);
          return;
        }
        if (!code || !state) {
          setStatus("error");
          setMessage("Parâmetros ausentes: code/state");
          return;
        }

        // Chama o backend para processar o callback e persistir tokens
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://intelligestor-backend.onrender.com";
        const resp = await fetch(`${backendUrl}/integrations/ml/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
        if (!resp.ok) {
          const txt = await resp.text();
          setStatus("error");
          setMessage(`Falha ao conectar conta: ${txt}`);
          return;
        }
        // Sucesso: backend já faz o redirect final; não é necessário ler o corpo
        setStatus("success");
        setMessage("Conta Mercado Livre conectada com sucesso!");
        // Redirecionar após alguns segundos para a área principal
        setTimeout(() => {
          window.location.href = "/ecommerce";
        }, 2000);
      } catch (e: unknown) {
        setStatus("error");
        if (e instanceof Error) {
          setMessage(`Erro inesperado: ${e.message}`);
        } else {
          setMessage(`Erro inesperado: ${String(e)}`);
        }
      }
    }
    run();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-semibold">Conectando...</h1>
            <p className="mt-3 text-sm text-gray-600">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold text-green-600">Conectado!</h1>
            <p className="mt-3 text-sm text-gray-700">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold text-red-600">Falha na conexão</h1>
            <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}
