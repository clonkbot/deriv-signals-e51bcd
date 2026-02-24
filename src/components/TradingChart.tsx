import { useEffect, useRef, useState } from "react";

interface PricePoint {
  time: number;
  price: number;
}

export function TradingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(1.0850);
  const dataRef = useRef<PricePoint[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate initial data
    const generateData = (): PricePoint[] => {
      const data: PricePoint[] = [];
      let price = 1.0850;
      const now = Date.now();

      for (let i = 100; i >= 0; i--) {
        const time = now - i * 60000; // 1 minute intervals
        const volatility = 0.0005 + Math.random() * 0.001;
        const trend = Math.sin(i / 20) * 0.002;
        price = price + (Math.random() - 0.5) * volatility * 2 + trend * 0.1;
        data.push({ time, price });
      }
      return data;
    };

    dataRef.current = generateData();
    setCurrentPrice(dataRef.current[dataRef.current.length - 1].price);
    setIsLoading(false);

    const drawChart = () => {
      const data = dataRef.current;
      if (data.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Calculate bounds
      const prices = data.map((d) => d.price);
      const minPrice = Math.min(...prices) - 0.0005;
      const maxPrice = Math.max(...prices) + 0.0005;
      const priceRange = maxPrice - minPrice;

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 6; i++) {
        const x = (width / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw price line
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.4)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

      ctx.beginPath();
      ctx.moveTo(0, height);

      data.forEach((point, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((point.price - minPrice) / priceRange) * height;

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.lineTo(width, height);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      data.forEach((point, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((point.price - minPrice) / priceRange) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Draw current price dot
      const lastPoint = data[data.length - 1];
      const lastX = width;
      const lastY = height - ((lastPoint.price - minPrice) / priceRange) * height;

      ctx.beginPath();
      ctx.arc(lastX - 4, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();

      // Glow effect
      ctx.beginPath();
      ctx.arc(lastX - 4, lastY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
      ctx.fill();

      // Draw price labels
      ctx.fillStyle = "#71717a";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";

      for (let i = 0; i <= 4; i++) {
        const price = maxPrice - (priceRange / 4) * i;
        const y = (height / 4) * i;
        ctx.fillText(price.toFixed(5), width - 8, y + 12);
      }
    };

    drawChart();

    // Update interval
    const interval = setInterval(() => {
      const data = dataRef.current;
      const lastPrice = data[data.length - 1].price;
      const change = (Math.random() - 0.5) * 0.0003;
      const newPrice = lastPrice + change;

      data.push({ time: Date.now(), price: newPrice });
      if (data.length > 101) data.shift();

      setCurrentPrice(newPrice);
      drawChart();
    }, 2000);

    // Resize handler
    const handleResize = () => drawChart();
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded-xl z-10">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-2xl font-bold text-white font-mono">{currentPrice.toFixed(5)}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] md:h-[400px] rounded-xl"
        style={{ display: "block" }}
      />
    </div>
  );
}
