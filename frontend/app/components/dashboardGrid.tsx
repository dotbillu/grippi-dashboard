"use client";
import { useEffect, useMemo, useState, useId } from "react";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { campaignsAtom, darkModeAtom, modalOpenAtom } from "../atoms";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { GripVertical, Plus, X } from "lucide-react";

type TrendPoint = { name: string } & Record<string, number>;

function SortableCard({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const transformString = transform
    ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 })
    : undefined;
  const style = {
    transform: transformString,
    transition: isDragging ? "transform 0.05s linear" : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={className}
    >
      {children}
    </div>
  );
}

function MetricsCard({
  campaigns,
  darkMode,
}: {
  campaigns: ReturnType<typeof useAtomValue<typeof campaignsAtom>>;
  darkMode: boolean;
}) {
  const [order, setOrder] = useState(["cost", "clicks", "impressions", "cpc"]);
  const dndId = useId();

  const metrics = useMemo(() => {
    const totalCost = campaigns.reduce((acc, c) => acc + c.cost, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
    const totalImpressions = campaigns.reduce(
      (acc, c) => acc + c.impressions,
      0,
    );
    const avgCost =
      totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : "0.00";

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (
    <div
      className={`p-4 rounded-xl border overflow-hidden flex flex-col h-[400px] ${
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs uppercase tracking-wide opacity-50">
          Key Metrics
        </h3>
        <span className="text-xs text-zinc-500">Drag to reorder metrics</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              setOrder((items) =>
                arrayMove(
                  items,
                  items.indexOf(active.id as string),
                  items.indexOf(over.id as string),
                ),
              );
            }
          }}
        >
          <SortableContext items={order} strategy={rectSortingStrategy}>
            {order.map((key) => (
              <div
                key={key}
                className={`p-4 rounded-xl shadow-sm border mb-3 flex items-center gap-3 select-none touch-none ${
                  darkMode
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                    : "bg-white border-zinc-200 text-zinc-800"
                }`}
              >
                <div className="cursor-grab text-zinc-500 hover:text-zinc-300 active:cursor-grabbing">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 flex justify-between items-center w-full">
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
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function TrendCard({
  campaigns,
  darkMode,
}: {
  campaigns: ReturnType<typeof useAtomValue<typeof campaignsAtom>>;
  darkMode: boolean;
}) {
  const trendData: TrendPoint[] = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ].map((day) => {
    const dayData: TrendPoint = { name: day };
    campaigns.forEach((c) => {
      const seed = c.id * (day.charCodeAt(0) + c.clicks);
      const randomVariance = (seed % 50) - 25;
      dayData[c.name] = Math.max(0, Math.floor(c.clicks / 7 + randomVariance));
    });
    return dayData;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl shadow-xl border text-xs ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-300"
              : "bg-white border-zinc-200 text-zinc-600"
          }`}
        >
          <p className="font-bold mb-2 text-sm border-b pb-1 border-dashed opacity-50">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              ></span>
              <span className="font-medium">{entry.name}:</span>
              <span
                className={`font-bold ${darkMode ? "text-white" : "text-zinc-900"}`}
              >
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`p-6 rounded-xl border h-[400px] flex flex-col ${
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}
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
              content={<CustomTooltip />}
              cursor={{
                stroke: darkMode ? "#52525b" : "#d4d4d8",
                strokeWidth: 1,
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
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DistributionCard({
  campaigns,
  darkMode,
}: {
  campaigns: ReturnType<typeof useAtomValue<typeof campaignsAtom>>;
  darkMode: boolean;
}) {
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const pieData = campaigns.slice(0, 5).map((c) => ({
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
                <Cell
                  key={i}
                  fill={COLORS[(i + colorOffset) % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div
      className={`p-6 rounded-xl border h-[350px] flex flex-col ${
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <h3 className="font-bold mb-2 text-center">Distribution</h3>
      <div className="flex-1 grid grid-cols-2 gap-2">
        {renderPie("cost", "By Cost", 0)}
        {renderPie("clicks", "By Clicks", 2)}
      </div>
      <div className="mt-auto pt-2 border-top border-zinc-500/20">
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
  );
}

function TableCard({
  campaigns,
  darkMode,
}: {
  campaigns: ReturnType<typeof useAtomValue<typeof campaignsAtom>>;
  darkMode: boolean;
}) {
  const [filter, setFilter] = useState("All");

  const filteredCampaigns =
    filter === "All" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div
      className={`rounded-xl border overflow-hidden flex flex-col h-[350px] ${
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <div
        className={`p-5 border-b flex items-center justify-between ${
          darkMode ? "border-zinc-800" : "border-zinc-100"
        }`}
      >
        <h3 className="font-bold">Campaign Details</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 py-1.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            darkMode
              ? "bg-black border-zinc-700 text-zinc-200"
              : "bg-white border-zinc-200 text-zinc-700"
          }`}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
        </select>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead
            className={`sticky top-0 z-10 ${
              darkMode ? "bg-black" : "bg-zinc-50"
            }`}
          >
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
            {filteredCampaigns.map((c) => (
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
        {filteredCampaigns.length === 0 && (
          <div className="p-8 text-center opacity-50 text-sm">
            No campaigns found.
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignModal({
  isOpen,
  closeModal,
  onSubmit,
  form,
  setForm,
  darkMode,
}: {
  isOpen: boolean;
  closeModal: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  form: {
    name: string;
    status: string;
    clicks: number;
    cost: number;
    impressions: number;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      status: string;
      clicks: number;
      cost: number;
      impressions: number;
    }>
  >;
  darkMode: boolean;
}) {
  if (!isOpen) return null;

  const inputClass = `w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? "bg-black border-zinc-700" : "bg-zinc-50 border-zinc-300"
  }`;

  return (
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
          <button onClick={closeModal} className="hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setForm({ ...form, cost: isNaN(val) ? 0 : val });
                }}
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
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setForm({ ...form, clicks: isNaN(val) ? 0 : val });
                }}
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
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setForm({ ...form, impressions: isNaN(val) ? 0 : val });
                }}
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
  );
}

export default function DashboardGrid() {
  const campaigns = useAtomValue(campaignsAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const [isOpen, setIsOpen] = useAtom(modalOpenAtom);
  const setCampaigns = useSetAtom(campaignsAtom);
  const [order, setOrder] = useState([
    "metrics",
    "trend",
    "table",
    "distribution",
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const [form, setForm] = useState({
    name: "",
    status: "Active",
    clicks: 0,
    cost: 0,
    impressions: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/campaigns`,
        form,
      );
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

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  const renderOverlay = (cardId: string | null) => {
    if (!cardId) return null;
    const wide = cardId === "trend" || cardId === "table";
    const wrapperClass = wide
      ? "w-[640px] max-w-[90vw]"
      : "w-[360px] max-w-[90vw]";
    if (cardId === "metrics") {
      return (
        <div className={wrapperClass}>
          <MetricsCard campaigns={campaigns} darkMode={darkMode} />
        </div>
      );
    }
    if (cardId === "trend") {
      return (
        <div className={wrapperClass}>
          <TrendCard campaigns={campaigns} darkMode={darkMode} />
        </div>
      );
    }
    if (cardId === "table") {
      return (
        <div className={wrapperClass}>
          <TableCard campaigns={campaigns} darkMode={darkMode} />
        </div>
      );
    }
    return (
      <div className={wrapperClass}>
        <DistributionCard campaigns={campaigns} darkMode={darkMode} />
      </div>
    );
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id as string)}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            setOrder((items) =>
              arrayMove(
                items,
                items.indexOf(active.id as string),
                items.indexOf(over.id as string),
              ),
            );
          }
          setActiveId(null);
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {order.map((card) => {
              if (card === "metrics") {
                return (
                  <SortableCard
                    id="metrics"
                    key="metrics"
                    className="col-span-12 lg:col-span-4"
                  >
                    <MetricsCard campaigns={campaigns} darkMode={darkMode} />
                  </SortableCard>
                );
              }
              if (card === "trend") {
                return (
                  <SortableCard
                    id="trend"
                    key="trend"
                    className="col-span-12 lg:col-span-8"
                  >
                    <TrendCard campaigns={campaigns} darkMode={darkMode} />
                  </SortableCard>
                );
              }
              if (card === "table") {
                return (
                  <SortableCard
                    id="table"
                    key="table"
                    className="col-span-12 lg:col-span-8"
                  >
                    <TableCard campaigns={campaigns} darkMode={darkMode} />
                  </SortableCard>
                );
              }
              return (
                <SortableCard
                  id="distribution"
                  key="distribution"
                  className="col-span-12 lg:col-span-4"
                >
                  <DistributionCard campaigns={campaigns} darkMode={darkMode} />
                </SortableCard>
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {renderOverlay(activeId)}
        </DragOverlay>
      </DndContext>
      <CampaignModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        darkMode={darkMode}
      />
    </>
  );
}
