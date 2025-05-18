"use client";
import Link from 'next/link';
import { Home, Calendar, CheckSquare, ListTodo, Clock1 } from "lucide-react";
import { usePathname } from "next/navigation";

const styleMap = {
  "/": { bg: "bg-home", border: "border-header-home" },
  "/calendar": { bg: "bg-calendar", border: "border-header-calendar" },
  "/todo": { bg: "bg-todo", border: "border-header-todo" },
  "/timer": { bg: "bg-timer", border: "border-header-timer" },
};

export default function Header() {
  const pathname = usePathname();
  const style = styleMap[pathname] || styleMap["/"];

  return (
    <header className={`p-4 text-white flex items-center justify-between ${style.bg} ${style.border}`}>
      <h1 className="text-xl font-bold">Productivity Planner</h1>
      <div className="flex gap-6 text-lg">
        <Link href="./" title="Home"><Home className="w-6 h-6" /></Link>
        <Link href="calendar" title="Calendar"><Calendar className="w-6 h-6" /></Link>
        <Link href="todo" title="To-Do"><CheckSquare className="w-6 h-6" /></Link>
        <Link href="habit_tracker" title="Habits"><ListTodo className="w-6 h-6" /></Link>
        <Link href="timer" title="Timer"><Clock1 className="w-6 h-6" /></Link>
      </div>
    </header>
  );
}
