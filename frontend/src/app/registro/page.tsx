"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistroRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona usuários para a página de login (onde há fluxo de registro)
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center text-sm text-gray-600">
        Redirecionando para a página de login...
      </div>
    </main>
  );
}
