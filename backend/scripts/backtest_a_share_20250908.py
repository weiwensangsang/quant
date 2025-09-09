import pandas as pd
import numpy as np
from datetime import datetime
import os
import glob
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.backtest.engine import BacktestEngine
from app.strategies.vectorbt_strategies import double_moving_average_strategy
import time
import warnings
warnings.filterwarnings('ignore')


for font in ['PingFang SC', 'Heiti TC', 'Microsoft YaHei', 'SimHei', 'WenQuanYi Micro Hei', 'DejaVu Sans']:
    try:
        plt.rcParams['font.sans-serif'] = [font]
        plt.rcParams['axes.unicode_minus'] = False
        break
    except:
        continue


def load_stock_data(csv_file):
    try:
        data = pd.read_csv(csv_file)
        data['trade_date'] = pd.to_datetime(data['trade_date'], format='%Y%m%d')
        data = data.set_index('trade_date')
        data.index.name = 'date'
        
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        if all(col in data.columns for col in required_cols):
            data = data.sort_index()
            return data[required_cols]
        else:
            return None
    except Exception as e:
        print(f"加载 {csv_file} 时出错: {e}")
        return None


def backtest_single_stock(csv_file):
    try:
        stock_code = os.path.basename(csv_file).replace('.csv', '')
        
        data = load_stock_data(csv_file)
        if data is None or len(data) < 250:
            return None
        
        entries, exits = double_moving_average_strategy(
            data["close"], 
            short_window=30, 
            long_window=120
        )
        
        engine = BacktestEngine(
            initial_capital=10000,
            commission=0.0001,
            slippage=0.0001
        )
        
        results = engine.run_backtest(data, entries, exits)
        
        return {
            "股票代码": stock_code,
            "总收益率": results["总收益率"],
            "年化收益率": results["年化收益率"],
            "最大回撤": results["最大回撤"],
            "夏普比率": results["夏普比率"],
            "交易次数": results["交易次数"],
            "胜率": results["胜率"],
            "最终资产": results["最终资产"]
        }
        
    except Exception as e:
        print(f"回测 {csv_file} 时出错: {e}")
        return None


def create_result_plots(df, result_dir):
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    try:
        plt.style.use('seaborn-v0_8-darkgrid')
    except:
        plt.style.use('default')
    
    fig = plt.figure(figsize=(20, 16))
    
    ax1 = plt.subplot(3, 3, 1)
    df['总收益率'].hist(bins=50, alpha=0.7, color='blue', edgecolor='black')
    ax1.set_title('收益率分布', fontsize=14, fontweight='bold')
    ax1.set_xlabel('总收益率')
    ax1.set_ylabel('频次')
    ax1.axvline(df['总收益率'].mean(), color='red', linestyle='--', label=f'平均值: {df["总收益率"].mean():.2%}')
    ax1.axvline(df['总收益率'].median(), color='green', linestyle='--', label=f'中位数: {df["总收益率"].median():.2%}')
    ax1.legend()
    
    ax2 = plt.subplot(3, 3, 2)
    df['夏普比率'].hist(bins=50, alpha=0.7, color='green', edgecolor='black')
    ax2.set_title('夏普比率分布', fontsize=14, fontweight='bold')
    ax2.set_xlabel('夏普比率')
    ax2.set_ylabel('频次')
    ax2.axvline(df['夏普比率'].mean(), color='red', linestyle='--', label=f'平均值: {df["夏普比率"].mean():.2f}')
    ax2.legend()
    
    ax3 = plt.subplot(3, 3, 3)
    top_n = min(20, len(df))
    top_stocks = df.nlargest(top_n, '夏普比率')
    bars = ax3.bar(range(len(top_stocks)), top_stocks['总收益率'], color='lightgreen', edgecolor='black')
    for i, bar in enumerate(bars):
        if top_stocks.iloc[i]['总收益率'] < 0:
            bar.set_color('lightcoral')
    ax3.set_title(f'夏普比率TOP {top_n}股票', fontsize=14, fontweight='bold')
    ax3.set_xlabel('排名')
    ax3.set_ylabel('总收益率')
    ax3.set_xticks(range(len(top_stocks)))
    ax3.set_xticklabels(range(1, len(top_stocks) + 1))
    for i, (idx, row) in enumerate(top_stocks.iterrows()):
        ax3.text(i, row['总收益率'] + 0.01, f"{row['总收益率']:.1%}", ha='center', va='bottom', fontsize=8)
    
    ax4 = plt.subplot(3, 3, 4)
    scatter = ax4.scatter(df['最大回撤'], df['总收益率'], 
                         c=df['夏普比率'], cmap='RdYlGn', alpha=0.6, s=50)
    ax4.set_title('收益率与最大回撤关系', fontsize=14, fontweight='bold')
    ax4.set_xlabel('最大回撤')
    ax4.set_ylabel('总收益率')
    ax4.axhline(0, color='black', linestyle='-', alpha=0.3)
    ax4.axvline(0, color='black', linestyle='-', alpha=0.3)
    cbar = plt.colorbar(scatter, ax=ax4)
    cbar.set_label('夏普比率')
    
    ax5 = plt.subplot(3, 3, 5)
    return_ranges = [
        ('> 100%', len(df[df['总收益率'] > 1])),
        ('50-100%', len(df[(df['总收益率'] > 0.5) & (df['总收益率'] <= 1)])),
        ('20-50%', len(df[(df['总收益率'] > 0.2) & (df['总收益率'] <= 0.5)])),
        ('0-20%', len(df[(df['总收益率'] > 0) & (df['总收益率'] <= 0.2)])),
        ('-20-0%', len(df[(df['总收益率'] > -0.2) & (df['总收益率'] <= 0)])),
        ('< -20%', len(df[df['总收益率'] <= -0.2]))
    ]
    labels = [r[0] for r in return_ranges]
    sizes = [r[1] for r in return_ranges]
    colors = ['darkgreen', 'green', 'lightgreen', 'yellow', 'orange', 'red']
    ax5.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
    ax5.set_title('收益率区间分布', fontsize=14, fontweight='bold')
    
    ax6 = plt.subplot(3, 3, 6)
    df['交易次数'].hist(bins=30, alpha=0.7, color='purple', edgecolor='black')
    ax6.set_title('交易次数分布', fontsize=14, fontweight='bold')
    ax6.set_xlabel('交易次数')
    ax6.set_ylabel('频次')
    ax6.axvline(df['交易次数'].mean(), color='red', linestyle='--', 
               label=f'平均值: {df["交易次数"].mean():.0f}')
    ax6.legend()
    
    ax7 = plt.subplot(3, 1, 3)
    ax7.axis('off')
    
    stats_text = f"""
    📊 整体统计信息
    
    回测股票总数: {len(df)}
    平均收益率: {df['总收益率'].mean():.2%}
    收益率中位数: {df['总收益率'].median():.2%}
    
    正收益股票数: {len(df[df['总收益率'] > 0])} ({len(df[df['总收益率'] > 0])/len(df)*100:.1f}%)
    负收益股票数: {len(df[df['总收益率'] < 0])} ({len(df[df['总收益率'] < 0])/len(df)*100:.1f}%)
    
    平均夏普比率: {df['夏普比率'].mean():.2f}
    平均最大回撤: {df['最大回撤'].mean():.2%}
    平均交易次数: {df['交易次数'].mean():.0f}
    平均胜率: {df['胜率'].mean():.2%}
    """
    
    ax7.text(0.1, 0.9, stats_text, transform=ax7.transAxes, 
            fontsize=12, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.suptitle(f'A股回测结果分析 - {timestamp}', fontsize=16, fontweight='bold')
    plt.tight_layout()
    
    plot_filename = os.path.join(result_dir, f'backtest_results_{timestamp}.png')
    plt.savefig(plot_filename, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"\n📊 结果图表已保存到: {plot_filename}")
    return plot_filename


def batch_backtest_local_data(data_dir, max_workers=50, limit=None):
    start_time = time.time()
    
    stock_files_pattern = os.path.join(data_dir, "a-share/start-20250908/stocks/*.csv")
    stock_files = glob.glob(stock_files_pattern)
    print(f"找到 {len(stock_files)} 个股票数据文件")
    
    if limit:
        stock_files = stock_files[:limit]
        print(f"限制回测前 {limit} 只股票")
    
    results = []
    failed = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(backtest_single_stock, file): file for file in stock_files}
        
        completed = 0
        total = len(stock_files)
        
        for future in as_completed(futures):
            completed += 1
            file = futures[future]
            
            try:
                result = future.result()
                if result:
                    results.append(result)
                else:
                    failed += 1
            except Exception as e:
                failed += 1
                print(f"处理 {file} 时出错: {e}")
            
            if completed % 100 == 0:
                elapsed = time.time() - start_time
                speed = completed / elapsed
                eta = (total - completed) / speed
                print(f"[{completed}/{total}] 速度: {speed:.1f} 只/秒, 预计剩余: {eta/60:.1f} 分钟")
    
    elapsed_time = time.time() - start_time
    
    if results:
        df = pd.DataFrame(results)
        df = df.sort_values("夏普比率", ascending=False)
        
        print("\n" + "="*80)
        print(f"✅ 批量回测完成！")
        print(f"⏱️  总耗时: {elapsed_time/60:.1f} 分钟 ({elapsed_time:.0f} 秒)")
        print(f"📊 成功: {len(results)} 只")
        print(f"❌ 失败: {failed} 只")
        print(f"🚀 平均速度: {len(stock_files)/elapsed_time:.1f} 只/秒")
        
        print("\n🏆 TOP 20 最佳股票（按夏普比率）:")
        print("-" * 80)
        top20 = df.head(20)
        for idx, row in top20.iterrows():
            print(f"{row['股票代码']:12} | "
                  f"收益率: {row['总收益率']:>8.2%} | "
                  f"回撤: {row['最大回撤']:>8.2%} | "
                  f"夏普: {row['夏普比率']:>6.2f} | "
                  f"交易: {row['交易次数']:>3}次")
        
        print("\n💀 BOTTOM 10 最差股票:")
        print("-" * 80)
        bottom10 = df.tail(10)
        for idx, row in bottom10.iterrows():
            print(f"{row['股票代码']:12} | "
                  f"收益率: {row['总收益率']:>8.2%} | "
                  f"回撤: {row['最大回撤']:>8.2%} | "
                  f"夏普: {row['夏普比率']:>6.2f}")
        
        print("\n📊 整体统计:")
        print(f"平均收益率: {df['总收益率'].mean():.2%}")
        print(f"收益率中位数: {df['总收益率'].median():.2%}")
        print(f"正收益股票: {len(df[df['总收益率'] > 0])} 只 ({len(df[df['总收益率'] > 0])/len(df)*100:.1f}%)")
        print(f"负收益股票: {len(df[df['总收益率'] < 0])} 只 ({len(df[df['总收益率'] < 0])/len(df)*100:.1f}%)")
        print(f"平均夏普比率: {df['夏普比率'].mean():.2f}")
        print(f"平均最大回撤: {df['最大回撤'].mean():.2%}")
        
        print("\n📈 收益率分布:")
        print(f"  > 100%: {len(df[df['总收益率'] > 1])} 只")
        print(f"  50-100%: {len(df[(df['总收益率'] > 0.5) & (df['总收益率'] <= 1)])} 只")
        print(f"  20-50%: {len(df[(df['总收益率'] > 0.2) & (df['总收益率'] <= 0.5)])} 只")
        print(f"  0-20%: {len(df[(df['总收益率'] > 0) & (df['总收益率'] <= 0.2)])} 只")
        print(f"  -20-0%: {len(df[(df['总收益率'] > -0.2) & (df['总收益率'] <= 0)])} 只")
        print(f"  < -20%: {len(df[df['总收益率'] <= -0.2])} 只")
        
        result_dir = os.path.join(os.path.dirname(__file__), 'result')
        os.makedirs(result_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        csv_filename = os.path.join(result_dir, f'backtest_results_{timestamp}.csv')
        df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
        print(f"\n💾 完整结果已保存到: {csv_filename}")
        
        plot_filename = create_result_plots(df, result_dir)
        
        return df
    
    return None


if __name__ == "__main__":
    print("🚀 使用本地数据的A股批量回测系统")
    print("=" * 80)
    print("回测参数:")
    print("📊 初始资金: 10,000 元")
    print("💰 手续费率: 0.01% (万分之一)")
    print("📉 滑点: 0.01%")
    print("📈 策略: 双均线 MA(30/120)")
    print("🔧 线程数: 50")
    print("=" * 80)
    
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / "data"
    
    print(f"\n📁 数据目录: {data_dir}")
    print("\n开始回测全部股票...")
    df = batch_backtest_local_data(str(data_dir), max_workers=50, limit=None)
