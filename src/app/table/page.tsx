"use client";

import { useEffect } from "react";
import Board from "@/components/Board";
import { isFormateur, setAppRole } from "@/lib/role";

export default function TablePage() {
  useEffect(() => {
    if (!isFormateur()) setAppRole("participant");
  }, []);
  return <Board variant="table" hostView={typeof window !== "undefined" && isFormateur()} />;
}
