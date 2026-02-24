import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Trash2,
  Activity,
  RefreshCw
} from "lucide-react";

// Simulated price data
const generatePrice = (basePrice: number) => {
  const change = (Math.random() - 0.5) * 0.002 * basePrice;
  return {
    price: basePrice + change,
    change: (change / basePrice) * 100,
  };
};

const symbolBasePrices: Record<string, number> = {
  "EUR/USD": 1.0850,
  "GBP/USD": 1.2680,
  "USD/JPY": 154.50,
  "XAU/USD": 2340.00,
  "BTC/USD": 67500.00,
  "ETH/USD": 3450.00,
};

export function WatchlistPanel() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});

  const watchlist = useQuery(api.watchlist.list);
  const addSymbol = useMutation(api.watchlist.add);
  const toggleSymbol = useMutation(api.watchlist.toggle);
  const removeSymbol = useMutation(api.watchlist.remove);

  const [newSymbol, setNewSymbol] = useState({
    symbol: "",
    displayName: "",
    exchange: "Deriv",
  });

  // Simulate live price updates
  useEffect(() => {
    const updatePrices = () => {
      const newPrices: Record<string, { price: number; change: number }> = {};
      watchlist?.forEach((item: { _id: string; symbol: string; displayName: string; exchange: string; isActive: boolean }) => {
        const basePrice = symbolBasePrices[item.symbol] || 1.0000;
        newPrices[item.symbol] = generatePrice(basePrice);
      });
      setPrices(newPrices);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleAdd = async () => {
    if (!newSymbol.symbol || !newSymbol.displayName) return;

    await addSymbol({
      symbol: newSymbol.symbol.toUpperCase(),
      displayName: newSymbol.displayName,
      exchange: newSymbol.exchange,
    });

    setNewSymbol({ symbol: "", displayName: "", exchange: "Deriv" });
    setShowAddModal(false);
  };

  const popularSymbols = [
    { symbol: "EUR/USD", name: "Euro / US Dollar", exchange: "Deriv" },
    { symbol: "GBP/USD", name: "British Pound / US Dollar", exchange: "Deriv" },
    { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", exchange: "Deriv" },
    { symbol: "XAU/USD", name: "Gold / US Dollar", exchange: "Deriv" },
    { symbol: "BTC/USD", name: "Bitcoin / US Dollar", exchange: "Deriv" },
    { symbol: "ETH/USD", name: "Ethereum / US Dollar", exchange: "Deriv" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Watchlist
            </span>
          </h2>
          <p className="text-zinc-500 mt-1">Monitor your favorite symbols</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            <RefreshCw size={12} className="animate-spin" />
            Live
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            Add Symbol
          </button>
        </div>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {watchlist?.map((item: { _id: string; symbol: string; displayName: string; exchange: string; isActive: boolean }, i: number) => {
            const priceData = prices[item.symbol] || { price: 0, change: 0 };
            const isPositive = priceData.change >= 0;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className={`relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 p-5 overflow-hidden group ${
                  !item.isActive && "opacity-50"
                }`}
              >
                {/* Background pulse effect */}
                <div className={`absolute inset-0 ${isPositive ? "bg-emerald-500/5" : "bg-red-500/5"} transition-colors`} />

                {/* Content */}
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">{item.symbol}</h3>
                      <p className="text-zinc-500 text-sm">{item.displayName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSymbol({ id: item._id })}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                      >
                        {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => removeSymbol({ id: item._id })}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white font-mono">
                        {priceData.price.toFixed(item.symbol.includes("JPY") ? 3 : item.symbol.includes("BTC") || item.symbol.includes("XAU") ? 2 : 5)}
                      </p>
                      <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-sm font-medium">
                          {isPositive ? "+" : ""}{priceData.change.toFixed(3)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-600 px-2 py-1 rounded-md bg-white/5">
                      {item.exchange}
                    </span>
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="mt-4 h-12 relative overflow-hidden rounded-lg bg-white/5">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d={`M0,${20 + Math.random() * 10} ${Array.from({ length: 10 }, (_, i) =>
                          `L${(i + 1) * 10},${15 + Math.random() * 15}`
                        ).join(" ")}`}
                        fill="none"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {(!watchlist || watchlist.length === 0) && (
          <div className="col-span-full text-center py-12 text-zinc-500">
            <Activity size={48} className="mx-auto mb-4 opacity-30" />
            <p>No symbols in watchlist</p>
            <p className="text-sm mt-1">Add symbols to start monitoring</p>
          </div>
        )}
      </div>

      {/* Add Symbol Modal */}
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
                <h3 className="text-xl font-bold text-white">Add Symbol</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Add */}
              <div className="mb-6">
                <p className="text-sm text-zinc-400 mb-3">Quick Add</p>
                <div className="grid grid-cols-2 gap-2">
                  {popularSymbols.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={async () => {
                        await addSymbol({
                          symbol: s.symbol,
                          displayName: s.name,
                          exchange: s.exchange,
                        });
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <TrendingUp size={14} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{s.symbol}</p>
                        <p className="text-zinc-500 text-xs truncate">{s.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-[#0d0d14] text-zinc-500">or add custom</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={newSymbol.symbol}
                    onChange={(e) => setNewSymbol({ ...newSymbol, symbol: e.target.value })}
                    placeholder="e.g., EUR/USD"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={newSymbol.displayName}
                    onChange={(e) => setNewSymbol({ ...newSymbol, displayName: e.target.value })}
                    placeholder="e.g., Euro / US Dollar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Exchange</label>
                  <select
                    value={newSymbol.exchange}
                    onChange={(e) => setNewSymbol({ ...newSymbol, exchange: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Deriv">Deriv</option>
                    <option value="TradingView">TradingView</option>
                    <option value="Binance">Binance</option>
                    <option value="OANDA">OANDA</option>
                  </select>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!newSymbol.symbol || !newSymbol.displayName}
                  className="w-full py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Watchlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
