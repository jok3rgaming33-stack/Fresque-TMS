"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { setAppRole } from "@/lib/role";

function Inner() {
  const router = useRouter();
  const code = useSearchParams().get("code");
  useEffect(() => {
    setAppRole("participant");
    router.replace(code ? `/participants?code=${code}` : "/participants");
  }, [router, code]);
  return null;
}

export default function RejoindreRedirect() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
