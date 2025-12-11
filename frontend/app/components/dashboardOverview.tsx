"use client";
import { useId, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { campaignsAtom, darkModeAtom } from "../atoms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

type TrendPoint = { name: string } & Record<string, number | string>;

function SortableMetricCard({
  id,
  children,
  darkMode,
}: {
  id: string;
  children: React.ReactNode;
  darkMode: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl shadow-sm border mb-3 flex items-center gap-3 select-none touch-none ${
        darkMode
          ? "bg-zinc-900 border-zinc-800 text-zinc-100"
          : "bg-white border-zinc-200 text-zinc-800"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function DashboardOverview() {
  const campaigns = useAtomValue(campaignsAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const [order, setOrder] = useState(["cost", "clicks", "impressions", "cpc"]);

  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const trendData: TrendPoint[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => {
      const dayData: TrendPoint = { name: day };
      campaigns.forEach((c) => {
        dayData[c.name] = Math.max(
          0,
          Math.floor(c.clicks / 7 + (Math.random() * 50 - 25))
        );
      });
      return dayData;
    }
  );

  const metrics = useMemo(() => {
    const totalCost = campaigns.reduce((acc, c) => acc + c.cost, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
    const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
    const avgCost = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : "0.00";

    return {
      cost: {
        title: "Total Cost",
        value: `$${totalCost.toFixed(0)}`,
        trend: "+2.5%",
        color: "text-emerald-500 bg-emerald-500/10",
      },
      clicks: {
        title: "Total Clicks",
        value: totalClicks.toLocaleString(),
        trend: "↗ 12%",
        color: "text-blue-500 bg-blue-500/10",
      },
      impressions: {
        title: "Impressions",
        value: `${(totalImpressions / 1000).toFixed(1)}k`,
        trend: "- 5%",
        color: "text-zinc-400 bg-zinc-500/10",
      },
      cpc: {
        title: "Avg CPC",
        value: `$${avgCost}`,
        trend: "~ 0%",
        color: "text-amber-500 bg-amber-500/10",
      },
    };
  }, [campaigns]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const topCampaigns = campaigns.slice(0, 5);
  const pieData = topCampaigns.map((c) => ({
    name: c.name,
    cost: c.cost,
    clicks: c.clicks,
  }));

  const renderPie = (dataKey: string, title: string, colorOffset = 0) => (
    <div className="relative">
      <p className="text-[10px] uppercase font-bold text-center mb-1 opacity-50">
        {title}
      </p>
      <div className="h-full w-full absolute inset-0 top-6">
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={25}
              outerRadius={40}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey="name"
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[(i + colorOffset) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        className={`flex-1 p-4 rounded-xl border overflow-hidden flex flex-col h-[400px] ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <h3 className="font-bold mb-3 px-1 text-xs uppercase tracking-wide opacity-50">
          Key Metrics
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (active.id !== over?.id) {
                setOrder((items) =>
                  arrayMove(
                    items,
                    items.indexOf(active.id as string),
                    items.indexOf(over?.id as string)
                  )
                );
              }
            }}
          >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {order.map((key) => (
                <SortableMetricCard key={key} id={key} darkMode={darkMode}>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-50 tracking-wider">
                        {metrics[key as keyof typeof metrics].title}
                      </p>
                      <h2 className="text-xl font-bold mt-0.5">
                        {metrics[key as keyof typeof metrics].value}
                      </h2>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        metrics[key as keyof typeof metrics].color
                      }`}
                    >
                      {metrics[key as keyof typeof metrics].trend}
                    </span>
                  </div>
                </SortableMetricCard>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div
        className={`p-6 rounded-xl border h-[400px] flex flex-col ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        } lg:col-span-2`}
      >
        <h3 className="font-bold mb-4">Performance Trends</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={darkMode ? "#27272a" : "#e4e4e7"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: darkMode ? "#18181b" : "#fff",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              {campaigns.map((c) => (
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

      <div
        className={`p-6 rounded-xl border h-[350px] flex flex-col ${
          darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        } lg:col-span-3`}
      >
        <h3 className="font-bold mb-2 text-center">Distribution</h3>
        <div className="flex-1 grid grid-cols-2 gap-2">
          {renderPie("cost", "By Cost", 0)}
          {renderPie("clicks", "By Clicks", 2)}
        </div>
        <div className="mt-auto pt-2 border-t border-zinc-500/20">
          <div className="flex flex-wrap justify-center gap-2 text-[10px] opacity-60">
            {pieData.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></span>
                <span className="truncate max-w-20">{c.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

