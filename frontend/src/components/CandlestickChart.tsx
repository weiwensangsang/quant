"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type Time } from "lightweight-charts";
import { sumBy, round } from "lodash";

export type TimeFrame = "1h" | "4h" | "1d" | "1w" | "1m";

interface StockData {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
}

interface CandlestickChartProps {
  data: StockData[];
  symbol?: string;
  timeFrame?: TimeFrame;
  height?: number;
  showVolume?: boolean;
}

const timeFrameLabels: Record<TimeFrame, string> = {
  "1h": "1 Hour",
  "4h": "4 Hours",
  "1d": "Daily",
  "1w": "Weekly",
  "1m": "Monthly",
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  symbol = "Stock",
  timeFrame = "1d",
  height = 600,
  showVolume = true,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ma5SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma10SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma30SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const processedData = useMemo(() => {
    const candleData: CandlestickData[] = data.map(item => ({
      time: item.date as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData: HistogramData[] = data.map(item => ({
      time: item.date as Time,
      value: item.volume,
      color: item.close >= item.open ? "#26a69a" : "#ef5350",
    }));

    const calculateMA = (period: number) => {
      return data.map((_, index) => {
        if (index < period - 1) return null;
        const sum = sumBy(data.slice(index - period + 1, index + 1), "close");
        const dataPoint = data[index];
        if (!dataPoint) return null;
        return {
          time: dataPoint.date as Time,
          value: round(sum / period, 2),
        };
      }).filter(item => item !== null);
    };

    return {
      candles: candleData,
      volume: volumeData,
      ma5: calculateMA(5),
      ma10: calculateMA(10),
      ma30: calculateMA(30),
    };
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#7c8798",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "#d0d0d0",
          style: 2,
          labelBackgroundColor: "#7c8798",
        },
        horzLine: {
          width: 1,
          color: "#d0d0d0",
          style: 2,
          labelBackgroundColor: "#7c8798",
        },
      },
      rightPriceScale: {
        borderColor: "#eeeeee",
      },
      timeScale: {
        borderColor: "#eeeeee",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef5350",
      downColor: "#26a69a",
      borderUpColor: "#ef5350",
      borderDownColor: "#26a69a",
      wickUpColor: "#ef5350",
      wickDownColor: "#26a69a",
    });
    candleSeriesRef.current = candleSeries;

    const ma5Series = chart.addSeries(LineSeries, {
      color: "#ffeb3b",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });
    ma5SeriesRef.current = ma5Series;

    const ma10Series = chart.addSeries(LineSeries, {
      color: "#00bcd4",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });
    ma10SeriesRef.current = ma10Series;

    const ma30Series = chart.addSeries(LineSeries, {
      color: "#e91e63",
      lineWidth: 1,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
    });
    ma30SeriesRef.current = ma30Series;

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    candleSeries.setData(processedData.candles);
    ma5Series.setData(processedData.ma5 as Array<{time: Time; value: number}>);
    ma10Series.setData(processedData.ma10 as Array<{time: Time; value: number}>);
    ma30Series.setData(processedData.ma30 as Array<{time: Time; value: number}>);

    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(processedData.volume);
    }

    chart.timeScale().fitContent();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, showVolume, processedData]);

  return (
    <div className="relative">
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#7c8798]">{symbol} - {timeFrameLabels[timeFrame]}</span>
          <span className="text-[#d0d0d0]">|</span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-yellow-400"></span>
            <span className="text-[#7c8798]">MA5</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-cyan-400"></span>
            <span className="text-[#7c8798]">MA10</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-pink-500"></span>
            <span className="text-[#7c8798]">MA30</span>
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
      <div className="absolute bottom-2 right-2 text-xs text-[#7c8798]">
        由 <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="text-[#509ee3] hover:text-[#4188d1]">TradingView</a> 提供技术支持
      </div>
    </div>
  );
};
