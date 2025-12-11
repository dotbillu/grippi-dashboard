"use client";
import { useAtom } from "jotai";
import { darkModeAtom, modalOpenAtom } from "../atoms"
import { Moon, Sun, Plus } from "lucide-react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [, setIsModalOpen] = useAtom(modalOpenAtom);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div>
        <h1
          className={`text-2xl font-bold ${darkMode ? "text-white" : "text-zinc-900"}`}
        >
          Campaign Analytics
        </h1>
        <p className="text-sm opacity-60">Real-time performance monitoring</p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-opacity-10 hover:bg-zinc-500 transition border border-transparent hover:border-zinc-300"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-sm w-full md:w-auto"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>
    </div>
  );
}
