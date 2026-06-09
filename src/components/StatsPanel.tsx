import { useAppStore } from '../store/useAppStore';
import { formatMonthDisplay, formatDateDisplay } from '../services/dataProcessor';
import { Flame, Calendar, BarChart3, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import type { ComparisonStats, ProcessedData } from '../types';

function calculateComparisonStats(data1: ProcessedData, data2: ProcessedData): ComparisonStats {
  const total1 = data1.stats.totalContributions;
  const total2 = data2.stats.totalContributions;
  const totalDiff = total2 - total1;
  const totalDiffPercent = total1 > 0 ? Math.round((totalDiff / total1) * 100) : 0;

  let winner: 'left' | 'right' | 'tie' = 'tie';
  if (total1 > total2) winner = 'left';
  else if (total2 > total1) winner = 'right';

  return {
    totalDiff,
    totalDiffPercent,
    longestStreakDiff: data2.stats.longestStreak - data1.stats.longestStreak,
    currentStreakDiff: data2.stats.currentStreak - data1.stats.currentStreak,
    mostActiveMonthDiff: data2.stats.mostActiveMonthCount - data1.stats.mostActiveMonthCount,
    maxContributionsDiff: data2.stats.maxContributions - data1.stats.maxContributions,
    winner,
  };
}

function DiffIndicator({ diff, positiveColor = 'text-green-400', negativeColor = 'text-red-400' }: { diff: number; positiveColor?: string; negativeColor?: string }) {
  if (diff === 0) return <span className="text-zinc-500 text-xs">持平</span>;
  return (
    <span className={`text-xs font-medium ${diff > 0 ? positiveColor : negativeColor}`}>
      {diff > 0 ? '+' : ''}{diff}
    </span>
  );
}

export function StatsPanel() {
  const { contributionData, contributionData2, loadingStatus, loadingStatus2, compareMode } = useAppStore();

  const showSingle = compareMode === 'single';
  const showCompare = compareMode === 'compare';

  const singleReady = loadingStatus === 'success' && contributionData;
  const compareReady = loadingStatus === 'success' && loadingStatus2 === 'success' && contributionData && contributionData2;

  const isLoading = showSingle
    ? loadingStatus === 'loading'
    : (loadingStatus === 'loading' || loadingStatus2 === 'loading');

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (showSingle && !singleReady) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (showCompare && !compareReady) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计 · 对比</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (showSingle && singleReady) {
    const { stats } = contributionData;

    const statItems = [
      {
        label: '总提交',
        value: stats.totalContributions.toLocaleString(),
        unit: '次',
        icon: <BarChart3 className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: '最长连续',
        value: stats.longestStreak.toString(),
        unit: '天',
        icon: <Flame className="w-4 h-4" />,
        color: 'text-orange-400',
      },
      {
        label: '当前连续',
        value: stats.currentStreak.toString(),
        unit: '天',
        icon: <Flame className="w-4 h-4" />,
        color: 'text-green-400',
      },
    ];

    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计</h3>
          <span className="text-xs text-zinc-600">过去 365 天</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className={`mb-1 ${item.color}`}>{item.icon}</div>
              <div className="text-lg font-bold text-white">
                {item.value}
                <span className="text-xs font-normal text-zinc-500 ml-1">
                  {item.unit}
                </span>
              </div>
              <div className="text-xs text-zinc-500">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-zinc-500">最活跃月份：</span>
            <span className="text-zinc-300 font-medium">
              {formatMonthDisplay(stats.mostActiveMonth)}
            </span>
            <span className="text-amber-500">
              ({stats.mostActiveMonthCount} 次)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-zinc-500">最高产日：</span>
            <span className="text-zinc-300 font-medium">
              {formatDateDisplay(stats.maxContributionsDate)}
            </span>
            <span className="text-yellow-500">
              ({stats.maxContributions} 次)
            </span>
          </div>
          {stats.longestStreak > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-zinc-500">最长连续：</span>
              <span className="text-zinc-300 font-medium">
                {formatDateDisplay(stats.longestStreakStart)} ~{' '}
                {formatDateDisplay(stats.longestStreakEnd)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showCompare && compareReady && contributionData && contributionData2) {
    const comparison = calculateComparisonStats(contributionData, contributionData2);

    const statItems = [
      {
        label: '总提交',
        value1: contributionData.stats.totalContributions.toLocaleString(),
        value2: contributionData2.stats.totalContributions.toLocaleString(),
        unit: '次',
        icon: <BarChart3 className="w-3.5 h-3.5" />,
        color1: 'text-blue-400',
        color2: 'text-rose-400',
        diff: comparison.totalDiff,
      },
      {
        label: '最长连续',
        value1: contributionData.stats.longestStreak.toString(),
        value2: contributionData2.stats.longestStreak.toString(),
        unit: '天',
        icon: <Flame className="w-3.5 h-3.5" />,
        color1: 'text-blue-400',
        color2: 'text-rose-400',
        diff: comparison.longestStreakDiff,
      },
      {
        label: '当前连续',
        value1: contributionData.stats.currentStreak.toString(),
        value2: contributionData2.stats.currentStreak.toString(),
        unit: '天',
        icon: <Flame className="w-3.5 h-3.5" />,
        color1: 'text-blue-400',
        color2: 'text-rose-400',
        diff: comparison.currentStreakDiff,
      },
    ];

    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">数据统计 · 对比</h3>
          <span className="text-xs text-zinc-600">过去 365 天</span>
        </div>

        <div className="flex items-center justify-center gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-blue-400 font-medium">{contributionData.displayName}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-zinc-600" />
            <TrendingUp className="w-3 h-3 text-amber-500" />
            <ArrowRight className="w-3 h-3 text-zinc-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-400 font-medium">{contributionData2.displayName}</span>
            <div className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className="p-2 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`${item.color1}`}>{item.icon}</div>
                <DiffIndicator diff={item.diff} />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className={`text-sm font-bold ${item.color1}`}>
                    {item.value1}
                  </div>
                  <div className={`text-sm font-bold ${item.color2}`}>
                    {item.value2}
                  </div>
                </div>
                <span className="text-[10px] font-normal text-zinc-500">
                  {item.unit}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-zinc-500">最活跃月份：</span>
            </div>
            <div className="text-right">
              <div className="text-blue-400">
                {formatMonthDisplay(contributionData.stats.mostActiveMonth)}
                <span className="text-zinc-500 ml-1">({contributionData.stats.mostActiveMonthCount})</span>
              </div>
              <div className="text-rose-400">
                {formatMonthDisplay(contributionData2.stats.mostActiveMonth)}
                <span className="text-zinc-500 ml-1">({contributionData2.stats.mostActiveMonthCount})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-zinc-500">最高产日：</span>
            </div>
            <div className="text-right">
              <div className="text-blue-400 text-[11px]">
                {formatDateDisplay(contributionData.stats.maxContributionsDate)}
                <span className="text-zinc-500 ml-1">({contributionData.stats.maxContributions})</span>
              </div>
              <div className="text-rose-400 text-[11px]">
                {formatDateDisplay(contributionData2.stats.maxContributionsDate)}
                <span className="text-zinc-500 ml-1">({contributionData2.stats.maxContributions})</span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-zinc-800">
            <div className="flex items-center justify-center gap-2">
              {comparison.winner === 'left' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/30">
                  <Trophy className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">
                    {contributionData.displayName} 领先
                  </span>
                  <span className="text-xs font-bold text-blue-500">
                    +{Math.abs(comparison.totalDiff).toLocaleString()}
                  </span>
                </div>
              )}
              {comparison.winner === 'right' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
                  <Trophy className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-medium text-rose-400">
                    {contributionData2.displayName} 领先
                  </span>
                  <span className="text-xs font-bold text-rose-500">
                    +{Math.abs(comparison.totalDiff).toLocaleString()}
                  </span>
                </div>
              )}
              {comparison.winner === 'tie' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">
                    势均力敌，旗鼓相当！
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
