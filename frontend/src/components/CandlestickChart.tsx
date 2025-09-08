"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type LineData, type Time } from "lightweight-charts";
import _ from "lodash";

export type TimeFrame = "1d" | "1w" | "1m";

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
  "1d": "日线",
  "1w": "周线",
  "1m": "月线",
};

const calculateMA = (data: StockData[], period: number): LineData[] => {
  const result: LineData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const sum = _.sumBy(data.slice(i - period + 1, i + 1), item => item.close);
    const ma = sum / period;
    const currentData = data[i];
    if (currentData) {
      result.push({
        time: currentData.date as Time,
        value: _.round(ma, 2),
      });
    }
  }

  return result;
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
      color: item.close >= item.open ? "rgba(239, 83, 80, 0.3)" : "rgba(38, 166, 154, 0.3)",
    }));

    const ma30Data = data.length >= 30 ? calculateMA(data, 30) : [];
    const ma120Data = data.length >= 120 ? calculateMA(data, 120) : [];

    return {
      candles: candleData,
      volume: volumeData,
      ma30: ma30Data,
      ma120: ma120Data,
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
        vertLines: { color: "#f5f5f5" },
        horzLines: { color: "#f5f5f5" },
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
        scaleMargins: {
          top: 0.05,
          bottom: 0.05,
        },
        mode: 0,
        autoScale: true,
      },
      timeScale: {
        borderColor: "#eeeeee",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        barSpacing: 12,
        rightOffset: 5,
        minBarSpacing: 8,
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
        bottom: showVolume ? 0.3 : 0.05,
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
          top: 0.75,
          bottom: 0.02,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    candleSeries.setData(processedData.candles);

    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(processedData.volume);
    }

    if (processedData.ma30.length > 0) {
      const ma30Series = chart.addSeries(LineSeries, {
        color: "#FF6B6B",
        lineWidth: 2,
        priceScaleId: "right",
      });
      ma30Series.setData(processedData.ma30);
    }

    if (processedData.ma120.length > 0) {
      const ma120Series = chart.addSeries(LineSeries, {
        color: "#4ECDC4",
        lineWidth: 2,
        priceScaleId: "right",
      });
      ma120Series.setData(processedData.ma120);
    }

    chart.timeScale().fitContent();
    if (data.length > 60) {
      const to = data[data.length - 1]?.date;
      const from = data[data.length - 60]?.date;
      if (from && to) {
        chart.timeScale().setVisibleRange({
          from: from as Time,
          to: to as Time,
        });
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height, showVolume, processedData, data]);

  return (
    <div className="relative">
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#7c8798] font-medium">{symbol} - {timeFrameLabels[timeFrame]}</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-[2px] bg-[#FF6B6B]"></span>
              <span className="text-gray-600">MA30</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-[2px] bg-[#4ECDC4]"></span>
              <span className="text-gray-600">MA120</span>
            </span>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
