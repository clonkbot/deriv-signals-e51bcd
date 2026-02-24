import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Percent,
  Trophy,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { TradingChart } from "./TradingChart";

export function Dashboard() {
  const stats = useQuery(api.signals.getStats);
  const recentSignals = useQuery(api.signals.list, { status: "active" });

  const statCards = [
    {
      label: "Win Rate",
      value: stats ? `${stats.winRate.toFixed(1)}%` : "—",
      icon: <Trophy size={20} />,
      color: "emerald",
      trend: stats && stats.winRate > 50 ? "up" : "down",
    },
    {
      label: "Avg R:R Ratio",
      value: stats ? `${stats.avgRR.toFixed(2)}` : "—",
      icon: <Target size={20} />,
      color: "cyan",
      trend: stats && stats.avgRR > 1.5 ? "up" : "neutral",
    },
    {
      label: "Active Trades",
      value: stats?.activeSignals.toString() || "0",
      icon: <Activity size={20} />,
      color: "violet",
      trend: "neutral",
    },
    {
      label: "Total P&L",
      value: stats ? `${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}%` : "—",
      icon: <Percent size={20} />,
      color: stats && stats.totalPnl >= 0 ? "emerald" : "red",
      trend: stats && stats.totalPnl >= 0 ? "up" : "down",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h2>
        <p className="text-zinc-500 mt-1">Real-time trading performance overview</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`relative group bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-5 overflow-hidden hover:border-${card.color}-500/30 transition-all duration-300`}
          >
            {/* Background glow */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-${card.color}-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="relative">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-${card.color}-500/20 text-${card.color}-400 mb-3`}>
                {card.icon}
              </div>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{card.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-xl md:text-2xl font-bold text-white">{card.value}</span>
                {card.trend === "up" && <ArrowUpRight size={16} className="text-emerald-400 mb-1" />}
                {card.trend === "down" && <ArrowDownRight size={16} className="text-red-400 mb-1" />}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart and Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Chart */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-2 bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Live Chart</h3>
              <p className="text-zinc-500 text-sm">EUR/USD • 1H</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>
          <TradingChart />
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>

          {stats ? (
            <div className="space-y-4">
              {/* Win/Loss Visual */}
              <div className="relative h-4 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.winRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {stats.wins} Wins
                </span>
                <span className="text-red-400 flex items-center gap-1">
                  {stats.losses} Losses
                  <TrendingDown size={14} />
                </span>
              </div>

              {/* Stats List */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total Trades</span>
                  <span className="text-white font-semibold">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Win Rate</span>
                  <span className={`font-semibold ${stats.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Avg R:R</span>
                  <span className={`font-semibold ${stats.avgRR >= 1.5 ? "text-emerald-400" : "text-amber-400"}`}>
                    {stats.avgRR.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Total P&L</span>
                  <span className={`font-semibold ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.totalPnl >= 0 ? "+" : ""}{stats.totalPnl.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Active Signals */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Signals</h3>
          <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
            {recentSignals?.length || 0} Active
          </span>
        </div>

        {recentSignals && recentSignals.length > 0 ? (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 md:px-0 pb-3">Symbol</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Entry</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Stop Loss</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSignals.slice(0, 5).map((signal: { _id: string; symbol: string; type: string; entryPrice: number; targetPrice?: number; stopLoss?: number; confidence: number; createdAt: number }) => (
                  <tr key={signal._id} className="text-sm">
                    <td className="px-4 md:px-0 py-3 font-semibold text-white">{signal.symbol}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        signal.type === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {signal.type === "BUY" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {signal.type}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-300 font-mono">{signal.entryPrice.toFixed(5)}</td>
                    <td className="py-3 text-emerald-400 font-mono">{signal.targetPrice?.toFixed(5) || "—"}</td>
                    <td className="py-3 text-red-400 font-mono">{signal.stopLoss?.toFixed(5) || "—"}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              signal.confidence >= 80 ? "bg-emerald-400" :
                              signal.confidence >= 60 ? "bg-amber-400" : "bg-red-400"
                            }`}
                            style={{ width: `${signal.confidence}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 text-xs">{signal.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-500 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(signal.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Activity size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No active signals</p>
            <p className="text-xs mt-1">Signals will appear here when detected</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
