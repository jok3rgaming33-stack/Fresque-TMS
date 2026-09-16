"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAppRole } from "@/lib/role";

export default function HoteRedirect() {
  const router = useRouter();
  useEffect(() => {
    setAppRole("formateur");
    router.replace("/formateur");
  }, [router]);
  return null;
}
