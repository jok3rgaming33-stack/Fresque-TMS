"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HoteRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/formateur");
  }, [router]);
  return null;
}
