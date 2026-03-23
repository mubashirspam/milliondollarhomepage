// app/admin/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Users,
  ShoppingBag,
  Grid3x3,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Stats {
  completedOrders: number;
  pendingOrders: number;
  totalRevenueINR: number;
  totalPixelsSold: number;
  totalUsers: number;
}

interface Purchase {
  id: string;
  userName: string;
  userEmail: string;
  amountINR: number;
  pixelCount: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
}

interface TopBuyer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpentINR: number;
  totalPixels: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "purchases" | "buyers">("overview");

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPurchases(data.purchases);
        setTopBuyers(data.topBuyers);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Check if already authed (cookie exists)
  useEffect(() => {
    fetch("/api/admin/data").then((res) => {
      if (res.ok) {
        setAuthed(true);
        fetchData();
      }
    });
  }, [fetchData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setAuthed(true);
        fetchData();
      } else {
        setLoginError("Invalid credentials");
      }
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    document.cookie = "admin_token=; max-age=0; path=/";
    setAuthed(false);
    setStats(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">milliondollarhomepage.in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <h1 className="font-bold">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">milliondollarhomepage.in</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={dataLoading}
            className="p-2 text-gray-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={<IndianRupee className="w-5 h-5 text-green-600" />}
              label="Total Revenue"
              value={`₹${stats.totalRevenueINR.toLocaleString("en-IN")}`}
              bg="bg-green-50"
            />
            <StatCard
              icon={<Grid3x3 className="w-5 h-5 text-blue-600" />}
              label="Pixels Sold"
              value={stats.totalPixelsSold.toLocaleString("en-IN")}
              bg="bg-blue-50"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              label="Completed Orders"
              value={String(stats.completedOrders)}
              bg="bg-emerald-50"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              label="Pending Orders"
              value={String(stats.pendingOrders)}
              bg="bg-yellow-50"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-purple-600" />}
              label="Total Users"
              value={String(stats.totalUsers)}
              bg="bg-purple-50"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit border border-gray-200">
          {(["overview", "purchases", "buyers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                tab === t
                  ? "bg-gray-900 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "purchases" ? (
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" /> Purchases
                </span>
              ) : t === "buyers" ? (
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Top Buyers
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Grid3x3 className="w-4 h-4" /> Overview
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <Row label="Total Revenue Collected" value={`₹${stats.totalRevenueINR.toLocaleString("en-IN")}`} />
              <Row label="Total Pixels Sold" value={`${stats.totalPixelsSold.toLocaleString("en-IN")} / 1,000,000`} />
              <Row label="Pixels Remaining" value={`${(1000000 - stats.totalPixelsSold).toLocaleString("en-IN")}`} />
              <Row label="Completion" value={`${((stats.totalPixelsSold / 1000000) * 100).toFixed(4)}%`} />
              <Row label="Avg Order Value" value={stats.completedOrders > 0 ? `₹${(stats.totalRevenueINR / stats.completedOrders).toFixed(2)}` : "—"} />
              <Row label="Registered Users" value={String(stats.totalUsers)} />
            </div>
          </div>
        )}

        {/* Purchases tab */}
        {tab === "purchases" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">All Purchases</h2>
              <span className="text-sm text-gray-500">{purchases.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">User</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Pixels</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Order ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{p.userName}</div>
                        <div className="text-xs text-gray-500">{p.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">
                        ₹{p.amountINR.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{p.pixelCount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        {p.razorpayOrderId?.slice(0, 20)}...
                      </td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        No purchases yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Buyers tab */}
        {tab === "buyers" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Top Buyers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">#</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">User</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Orders</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Pixels</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topBuyers.map((b, i) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 font-bold">#{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{b.name || "—"}</div>
                        <div className="text-xs text-gray-500">{b.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{b.orders}</td>
                      <td className="px-4 py-3 text-gray-700">{b.totalPixels.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-bold text-green-700">
                        ₹{b.totalSpentINR.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                  {topBuyers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-white shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
