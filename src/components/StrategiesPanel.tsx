import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Zap,
  ZapOff,
  Trash2,
  Activity,
  BarChart2,
  Clock,
  CheckCircle
} from "lucide-react";

const indicatorOptions = [
  "RSI", "MACD", "EMA", "SMA", "Bollinger Bands", "Stochastic",
  "ATR", "ADX", "Fibonacci", "VWAP", "Ichimoku", "Support/Resistance"
];

const timeframeOptions = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];

export function StrategiesPanel() {
  const [showAddModal, setShowAddModal] = useState(false);

  const strategies = useQuery(api.strategies.list);
  const createStrategy = useMutation(api.strategies.create);
  const toggleStrategy = useMutation(api.strategies.toggle);
  const removeStrategy = useMutation(api.strategies.remove);

  const [newStrategy, setNewStrategy] = useState({
    name: "",
    description: "",
    rules: "",
    indicators: [] as string[],
    timeframes: [] as string[],
  });

  const handleCreate = async () => {
    if (!newStrategy.name || !newStrategy.description) return;

    await createStrategy({
      name: newStrategy.name,
      description: newStrategy.description,
      rules: newStrategy.rules,
      indicators: newStrategy.indicators,
      timeframes: newStrategy.timeframes,
    });

    setNewStrategy({
      name: "",
      description: "",
      rules: "",
      indicators: [],
      timeframes: [],
    });
    setShowAddModal(false);
  };

  const toggleIndicator = (indicator: string) => {
    setNewStrategy((prev) => ({
      ...prev,
      indicators: prev.indicators.includes(indicator)
        ? prev.indicators.filter((i) => i !== indicator)
        : [...prev.indicators, indicator],
    }));
  };

  const toggleTimeframe = (tf: string) => {
    setNewStrategy((prev) => ({
      ...prev,
      timeframes: prev.timeframes.includes(tf)
        ? prev.timeframes.filter((t) => t !== tf)
        : [...prev.timeframes, tf],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Strategies
            </span>
          </h2>
          <p className="text-zinc-500 mt-1">Configure your trading strategies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          New Strategy
        </button>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {strategies?.map((strategy: { _id: string; name: string; description: string; isActive: boolean; indicators: string[]; timeframes: string[]; totalTrades: number; winRate?: number }, i: number) => (
            <motion.div
              key={strategy._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className={`relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-5 overflow-hidden ${
                !strategy.isActive && "opacity-60"
              }`}
            >
              {/* Status badge */}
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                strategy.isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-zinc-500/20 text-zinc-400"
              }`}>
                {strategy.isActive ? <Zap size={12} /> : <ZapOff size={12} />}
                {strategy.isActive ? "Active" : "Inactive"}
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-lg text-white pr-24">{strategy.name}</h3>
                <p className="text-zinc-500 text-sm mt-1">{strategy.description}</p>
              </div>

              {/* Indicators */}
              {strategy.indicators.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BarChart2 size={12} /> Indicators
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.indicators.map((ind: string) => (
                      <span
                        key={ind}
                        className="px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-medium"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeframes */}
              {strategy.timeframes.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock size={12} /> Timeframes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strategy.timeframes.map((tf: string) => (
                      <span
                        key={tf}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-medium"
                      >
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-zinc-500">Total Trades</p>
                  <p className="text-white font-semibold">{strategy.totalTrades}</p>
                </div>
                {strategy.winRate !== undefined && (
                  <div>
                    <p className="text-xs text-zinc-500">Win Rate</p>
                    <p className={`font-semibold ${strategy.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                      {strategy.winRate.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => toggleStrategy({ id: strategy._id })}
                  className={`p-2 rounded-lg transition-all ${
                    strategy.isActive
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  {strategy.isActive ? <Zap size={18} /> : <ZapOff size={18} />}
                </button>
                <button
                  onClick={() => removeStrategy({ id: strategy._id })}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!strategies || strategies.length === 0) && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <Activity size={48} className="mx-auto mb-4 opacity-30" />
            <p>No strategies configured</p>
            <p className="text-sm mt-1">Create your first trading strategy</p>
          </div>
        )}
      </div>

      {/* Add Strategy Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0d0d14] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">New Strategy</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Strategy Name</label>
                  <input
                    type="text"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                    placeholder="e.g., RSI Reversal"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Description</label>
                  <textarea
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                    placeholder="Describe how this strategy works..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Indicators</label>
                  <div className="flex flex-wrap gap-2">
                    {indicatorOptions.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => toggleIndicator(ind)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                          newStrategy.indicators.includes(ind)
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20"
                        }`}
                      >
                        {newStrategy.indicators.includes(ind) && <CheckCircle size={14} />}
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Timeframes</label>
                  <div className="flex flex-wrap gap-2">
                    {timeframeOptions.map((tf) => (
                      <button
                        key={tf}
                        onClick={() => toggleTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                          newStrategy.timeframes.includes(tf)
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20"
                        }`}
                      >
                        {newStrategy.timeframes.includes(tf) && <CheckCircle size={14} />}
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Trading Rules (JSON)</label>
                  <textarea
                    value={newStrategy.rules}
                    onChange={(e) => setNewStrategy({ ...newStrategy, rules: e.target.value })}
                    placeholder='{"condition": "RSI < 30", "action": "BUY"}'
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-sm"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newStrategy.name || !newStrategy.description}
                  className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Strategy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
