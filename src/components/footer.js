"use client";

import { usePathname } from "next/navigation";

const styleMap = {
  "/": { bg: "bg-home", border: "border-footer-home" },
  "/calendar": { bg: "bg-calendar", border: "border-footer-calendar" },
  "/todo": { bg: "bg-todo", border: "border-footer-todo" },
  "/timer": { bg: "bg-timer", border: "border-footer-timer" },
  "/habit_tracker": { bg: "bg-habit", border: "border-footer-habit" },
};

export default function Footer() {
  const pathname = usePathname();
  const style = styleMap[pathname] || styleMap["/"];

  return (
    <footer className={`p-4 text-center text-white ${style.bg} ${style.border}`}>
      <p>&copy; 2025 StarFlow</p>
    </footer>
  );
}
