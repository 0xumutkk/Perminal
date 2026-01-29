"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Loader2 } from "lucide-react";

interface Candlestick {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface MarketChartProps {
    ticker: string;
}

export function MarketChart({ ticker }: MarketChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interval, setInterval] = useState("1h");

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#94a3b8",
            },
            grid: {
                vertLines: { color: "#1e293b" },
                horzLines: { color: "#1e293b" },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                borderColor: "#334155",
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: "#334155",
            },
        });

        // Create candlestick series using v5 API
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#10b981",
            downColor: "#ef4444",
            borderUpColor: "#10b981",
            borderDownColor: "#ef4444",
            wickUpColor: "#10b981",
            wickDownColor: "#ef4444",
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!ticker || !seriesRef.current) return;

        const fetchCandlesticks = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/dflow/candlesticks?ticker=${ticker}&interval=${interval}&limit=100`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch candlesticks");
                }

                if (!data.candlesticks || data.candlesticks.length === 0) {
                    setError("No price history available for this market yet");
                    setIsLoading(false);
                    return;
                }

                // Transform data for lightweight-charts
                const formattedData = data.candlesticks.map((candle: Candlestick) => ({
                    time: candle.time as number,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                }));

                seriesRef.current?.setData(formattedData);
                chartRef.current?.timeScale().fitContent();
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching candlesticks:", err);
                setError(err instanceof Error ? err.message : "Failed to load chart");
                setIsLoading(false);
            }
        };

        fetchCandlesticks();
    }, [ticker, interval]);

    return (
        <div className="relative">
            {/* Interval Selector */}
            <div className="mb-3 flex gap-2">
                {["1h", "1d", "1w"].map((int) => (
                    <button
                        key={int}
                        onClick={() => setInterval(int)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${interval === int
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                    >
                        {int}
                    </button>
                ))}
            </div>

            {/* Chart Container */}
            <div className="relative rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="text-sm text-slate-500">{error}</p>
                    </div>
                )}

                <div
                    ref={chartContainerRef}
                    className={error && !isLoading ? "hidden" : ""}
                />
            </div>
        </div>
    );
}
