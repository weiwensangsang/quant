"use client";

import React, { useState } from "react";
import { CandlestickChart, type TimeFrame } from "@/components";
import type { StockData } from "@/services";
import _ from "lodash";

const generateMockData = (days: number): StockData[] => {
  const data: StockData[] = [];
  let currentPrice = 100;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const volatility = _.random(0.01, 0.05);
    const trend = _.random(-1, 1) * volatility;

    const open = currentPrice;
    const close = open * (1 + trend);
    const high = Math.max(open, close) * (1 + _.random(0, volatility));
    const low = Math.min(open, close) * (1 - _.random(0, volatility));
    const volume = _.random(1000000, 5000000);

    const dateStr = date.toISOString().split("T")[0] as string;
    data.push({
      date: dateStr,
      open: _.round(open, 2),
      close: _.round(close, 2),
      high: _.round(high, 2),
      low: _.round(low, 2),
      volume,
    });

    currentPrice = close;
  }

  return data;
};

export default function CandlestickPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1d");
  const [showVolume, setShowVolume] = useState(true);
  const [data] = useState<StockData[]>(() => generateMockData(100));

  const timeFrameButtons: { value: TimeFrame; label: string }[] = [
    { value: "1h", label: "1小时" },
    { value: "4h", label: "4小时" },
    { value: "1d", label: "日线" },
    { value: "1w", label: "周线" },
    { value: "1m", label: "月线" },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            A股市场
          </h1>
          <p className="text-base text-gray-600">
            实时K线图与技术分析
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {_.map(timeFrameButtons, ({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeFrame(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFrame === value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all"
            >
              成交量: {showVolume ? "开启" : "关闭"}
            </button>
          </div>

          <CandlestickChart
            data={data}
            symbol="SH000001"
            timeFrame={timeFrame}
            showVolume={showVolume}
            height={600}
          />
        </div>
      </div>
    </div>
  );
}
