import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Tuple
import vectorbt as vbt
from datetime import datetime


class BacktestEngine:
    def __init__(
        self,
        initial_capital: float = 100000,
        commission: float = 0.001,
        slippage: float = 0.001
    ):
        self.initial_capital = initial_capital
        self.commission = commission
        self.slippage = slippage
        
    def run_backtest(
        self,
        data: pd.DataFrame,
        entry_signals: pd.Series,
        exit_signals: pd.Series,
        size: Optional[float] = None,
        size_type: str = "percent"
    ) -> Dict[str, Any]:
        if size is None:
            size = 100 if size_type == "percent" else self.initial_capital
            
        portfolio = vbt.Portfolio.from_signals(
            close=data["close"],
            entries=entry_signals,
            exits=exit_signals,
            init_cash=self.initial_capital,
            fees=self.commission,
            slippage=self.slippage,
            size=size,
            size_type=size_type,
            freq="D"
        )
        
        return self._analyze_results(portfolio, data)
        
    def _analyze_results(self, portfolio: vbt.Portfolio, data: pd.DataFrame) -> Dict[str, Any]:
        stats = portfolio.stats()
        
        trades = portfolio.trades.records_readable
        win_rate = 0
        avg_duration = 0
        
        if not trades.empty:
            win_rate = len(trades[trades["PnL"] > 0]) / len(trades)
            if "Duration" in trades.columns:
                avg_duration = trades["Duration"].mean()
            else:
                avg_duration = 0
        
        results = {
            "总收益率": float(portfolio.total_return()),
            "年化收益率": float(portfolio.annualized_return()),
            "最大回撤": float(portfolio.max_drawdown()),
            "夏普比率": float(portfolio.sharpe_ratio()),
            "胜率": float(win_rate),
            "交易次数": int(portfolio.trades.count()),
            "平均持仓天数": float(avg_duration),
            "最终资产": float(portfolio.final_value()),
            "初始资产": self.initial_capital,
            "累计收益曲线": portfolio.cumulative_returns().to_dict(),
            "资产曲线": portfolio.value().to_dict(),
            "回撤曲线": portfolio.drawdown().to_dict(),
            "统计指标": {k: float(v) if isinstance(v, (np.float64, np.float32)) else v for k, v in stats.items()}
        }
        
        return results
