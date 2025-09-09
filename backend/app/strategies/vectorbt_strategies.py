import pandas as pd
import vectorbt as vbt
from typing import Tuple


def double_moving_average_strategy(
    close: pd.Series,
    short_window: int = 30,
    long_window: int = 120
) -> Tuple[pd.Series, pd.Series]:
    fast_moving_average = vbt.MA.run(close, window=short_window)
    slow_moving_average = vbt.MA.run(close, window=long_window)
    
    entries = fast_moving_average.ma_crossed_above(slow_moving_average)
    exits = fast_moving_average.ma_crossed_below(slow_moving_average)
    
    return entries, exits
