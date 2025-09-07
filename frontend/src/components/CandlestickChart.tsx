"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type Time } from "lightweight-charts";

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
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

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
      color: item.close >= item.open ? "rgba(239, 83, 80, 0.5)" : "rgba(38, 166, 154, 0.5)",
    }));

    return {
      candles: candleData,
      volume: volumeData,
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
        attributionLogo: false,
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
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      localization: {
        locale: "zh-CN",
        dateFormat: "yyyy/MM/dd",
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
      priceScaleId: "right",
    });

    chart.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: showVolume ? 0.32 : 0.05,
      },
    });

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.77,
          bottom: 0.02,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    candleSeries.setData(processedData.candles);

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
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
