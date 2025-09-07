import { apiClient } from "@/api";
import type { TimeFrame } from "@/components";

export interface StockData {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
  volume: number;
}

export interface StockInfo {
  symbol: string;
  name: string;
  exchange: string;
}

export const stockService = {
  async getCandlestickData(
    symbol: string,
    timeFrame: TimeFrame,
    startDate?: string,
    endDate?: string,
  ): Promise<StockData[]> {
    try {
      const response = await apiClient.get("/api/stock/candlestick", {
        params: {
          symbol,
          timeFrame,
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error("获取蜡烛图数据失败:", error);
      return [];
    }
  },

  async getStockInfo(symbol: string): Promise<StockInfo | null> {
    try {
      const response = await apiClient.get(`/api/stock/info/${symbol}`);
      return response.data;
    } catch (error) {
      console.error("获取股票信息失败:", error);
      return null;
    }
  },

  async searchStocks(keyword: string): Promise<StockInfo[]> {
    try {
      const response = await apiClient.get("/api/stock/search", {
        params: { keyword },
      });
      return response.data;
    } catch (error) {
      console.error("搜索股票失败:", error);
      return [];
    }
  },
};