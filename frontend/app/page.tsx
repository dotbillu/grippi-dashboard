"use client";

import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Campaign {
  id: number;
  name: string;
  status: "Active" | "Paused";
  clicks: number;
  cost: number;
  impressions: number;
  color: string; // Added color for the graph lines
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    // 1. Mock Data with colors assigned
    setCampaigns([
      { id: 1, name: "Summer Sale", status: "Active", clicks: 1250, cost: 450.00, impressions: 1000, color: "#2563eb" }, // Blue
      { id: 2, name: "Black Friday", status: "Paused", clicks: 320, cost: 89.50, impressions: 2500, color: "#94a3b8" }, // Gray
      { id: 3, name: "Influencer", status: "Active", clicks: 800, cost: 210.20, impressions: 5600, color: "#16a34a" }, // Green
      { id: 4, name: "Retargeting", status: "Active", clicks: 450, cost: 125.00, impressions: 3400, color: "#d97706" }, // Orange
    ]);
  }, []);

  // 2. Filter Logic
  const filteredCampaigns = campaigns.filter((c) => 
    filter === "All" ? true : c.status === filter
  );

  // 3. Dynamic Data Generation for the Graph (Makes it look "Real")
  // This creates mock history data for the graph based on the campaigns
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      const dayData: any = { name: day };
      filteredCampaigns.forEach((c) => {
        // Randomize data slightly so lines look different
        dayData[c.name] = Math.floor(c.clicks / 7 + (Math.random() * 50 - 25)); 
      });
      return dayData;
    });
  };

  const chartData = generateChartData();

  // Metrics Calculation
  const totalCost = filteredCampaigns.reduce((acc, curr) => acc + curr.cost, 0);
  const totalClicks = filteredCampaigns.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalImpressions = filteredCampaigns.reduce((acc, curr) => acc + curr.impressions, 0);
  const avgCost = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-6 font-sans text-slate-600">
      
      {/* HEADER & FILTER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Analytics</h1>
          <p className="text-sm text-slate-500">Real-time performance monitoring</p>
        </div>
        <div className="flex gap-2">
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md shadow-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            >
                <option value="All">All Campaigns</option>
                <option value="Active">Active Only</option>
                <option value="Paused">Paused Only</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
                + New Campaign
            </button>
        </div>
      </div>

      {/* METRIC CARDS GRID (4 Columns like the image) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Cost</p>
                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">+2.5%</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800">${totalCost.toFixed(2)}</h2>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Clicks</p>
                <span className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded">↗ 12%</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800">{totalClicks.toLocaleString()}</h2>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Impressions</p>
                <span className="text-slate-400 text-xs font-bold bg-slate-100 px-2 py-1 rounded">- 5%</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800">{(totalImpressions / 1000).toFixed(1)}k</h2>
        </div>

         {/* Card 4 */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Avg CPC</p>
                <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded">~ 0%</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800">${avgCost}</h2>
        </div>
      </div>

      {/* GRAPH SECTION */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <h3 className="font-bold text-slate-700 mb-6">Campaign Performance Trends (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="top" height={36}/>
                {/* Dynamically render a line for every campaign */}
                {filteredCampaigns.map((c) => (
                    <Line 
                        key={c.id} 
                        type="monotone" 
                        dataKey={c.name} 
                        stroke={c.color} 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={{ r: 6 }} 
                    />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clicks</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Impressions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">{campaign.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        campaign.status === "Active" ? "bg-green-500" : "bg-gray-500"
                    }`}></span>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{campaign.clicks.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">${campaign.cost.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600">{campaign.impressions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCampaigns.length === 0 && (
            <div className="p-8 text-center text-slate-400">No data available for this filter.</div>
        )}
      </div>
    </div>
  );
}
