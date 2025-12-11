"use client";
import axios from "axios";
import { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { campaignsAtom, darkModeAtom } from "./atoms";

import Navbar from "./components/navbar";
import DashboardGrid from "./components/dashboardGrid";

export default function Dashboard() {
  const [, setCampaigns] = useAtom(campaignsAtom);
  const darkMode = useAtomValue(darkModeAtom);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch((err) => console.log(err));
  }, [setCampaigns]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-4 md:p-6 ${darkMode ? "bg-black text-zinc-100" : "bg-zinc-50 text-zinc-600"}`}
    >
      <div className="max-w-[1600px] mx-auto">
        <Navbar />
        <div className="grid grid-cols-1 gap-6">
          <DashboardGrid />
        </div>
      </div>
    </div>
  );
}
