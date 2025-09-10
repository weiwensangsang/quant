
import numpy as np
import pandas as pd
import vectorbt as vbt


def double_moving_average_strategy(
    close: pd.Series,
    short_window: int = 30,
    long_window: int = 120
) -> tuple[pd.Series, pd.Series]:
    fast_moving_average = vbt.MA.run(close, window=short_window)
    slow_moving_average = vbt.MA.run(close, window=long_window)

    entries = fast_moving_average.ma_crossed_above(slow_moving_average)
    exits = fast_moving_average.ma_crossed_below(slow_moving_average)

    return entries, exits


def double_moving_average_strategy_low_frequency(
    close: pd.Series,
    volume: pd.Series = None,
    short_window: int = 20,
    long_window: int = 60,
    min_holding_days: int = 20,
    volume_threshold: float = 1.2,
    price_threshold: float = 0.02,
    price_range: tuple[float, float] = (10, 50)
) -> tuple[pd.Series, pd.Series]:
    fast_ma = vbt.MA.run(close, window=short_window)
    slow_ma = vbt.MA.run(close, window=long_window)

    raw_entries = fast_ma.ma_crossed_above(slow_ma)
    raw_exits = fast_ma.ma_crossed_below(slow_ma)

    entries = raw_entries.copy()
    exits = raw_exits.copy()

    ma_diff_pct = (fast_ma.ma - slow_ma.ma) / slow_ma.ma
    entries &= (ma_diff_pct > price_threshold)

    min_price, max_price = price_range
    price_in_range = (close >= min_price) & (close <= max_price)
    entries &= price_in_range

    if volume is not None:
        volume_ma = vbt.MA.run(volume, window=20)
        volume_ratio = volume / volume_ma.ma
        entries &= (volume_ratio > volume_threshold)

    last_entry_idx = -np.inf
    for i in range(len(entries)):
        if entries.iloc[i]:
            if i - last_entry_idx < min_holding_days:
                entries.iloc[i] = False
            else:
                last_entry_idx = i
                for j in range(i + 1, min(i + min_holding_days, len(exits))):
                    exits.iloc[j] = False

    return entries, exits
