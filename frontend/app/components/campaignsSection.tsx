"use client";
import axios from "axios";
import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { campaignsAtom, darkModeAtom, modalOpenAtom } from "../atoms";
import { X, Plus } from "lucide-react";

export default function CampaignsSection() {
  const campaigns = useAtomValue(campaignsAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const [isOpen, setIsOpen] = useAtom(modalOpenAtom);
  const setCampaigns = useSetAtom(campaignsAtom);
  const [form, setForm] = useState({
    name: "",
    status: "Active",
    clicks: 0,
    cost: 0,
    impressions: 0,
  });

  const inputClass = `w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? "bg-black border-zinc-700" : "bg-zinc-50 border-zinc-300"
  }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://127.0.0.1:8000/campaigns", form);
      setCampaigns((prev) => [...prev, data]);
      setIsOpen(false);
      setForm({
        name: "",
        status: "Active",
        clicks: 0,
        cost: 0,
        impressions: 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        className={`rounded-xl border overflow-hidden flex flex-col lg:col-span-3 ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <div
          className={`p-5 border-b flex items-center justify-between ${
            darkMode ? "border-zinc-800" : "border-zinc-100"
          }`}
        >
          <h3 className="font-bold">Campaign Details</h3>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition shadow-sm"
          >
            <Plus size={18} /> New Campaign
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${darkMode ? "bg-black" : "bg-zinc-50"}`}>
              <tr>
                {["Campaign", "Status", "Clicks", "Cost"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-xs font-bold uppercase opacity-50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-zinc-800" : "divide-zinc-100"
              }`}
            >
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className={`${
                    darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        c.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {c.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">${c.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div
            className={`p-6 rounded-xl w-full max-w-md shadow-2xl ${
              darkMode
                ? "bg-zinc-900 border border-zinc-800 text-white"
                : "bg-white text-zinc-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Launch Campaign</h2>
              <button onClick={() => setIsOpen(false)} className="hover:text-red-500">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase opacity-50 mb-1">
                  Name
                </label>
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-50 mb-1">
                    Status
                  </label>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase opacity-50 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    required
                    className={inputClass}
                    value={form.cost}
                    onChange={(e) =>
                      setForm({ ...form, cost: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-50 mb-1">
                    Clicks
                  </label>
                  <input
                    type="number"
                    required
                    className={inputClass}
                    value={form.clicks}
                    onChange={(e) =>
                      setForm({ ...form, clicks: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase opacity-50 mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    required
                    className={inputClass}
                    value={form.impressions}
                    onChange={(e) =>
                      setForm({ ...form, impressions: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2"
              >
                Launch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

