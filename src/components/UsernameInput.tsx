import { useState, useRef } from 'react';
import { Search, Loader2, Sparkles, Users, User } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateMockData } from '../services/dataProcessor';
import type { CompareMode } from '../types';

export function UsernameInput() {
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const {
    loadingStatus,
    loadingStatus2,
    compareMode,
    fetchData,
    fetchData2,
    fetchBoth,
    setError,
    setError2,
    contributionData,
    contributionData2,
    clearAll,
    setCompareMode,
    generateDemoCompare,
  } = useAppStore();

  const handleModeChange = (mode: CompareMode) => {
    setCompareMode(mode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (compareMode === 'single') {
      if (inputValue.trim()) {
        fetchData(inputValue.trim());
      }
    } else {
      if (inputValue.trim() && inputValue2.trim()) {
        fetchBoth(inputValue.trim(), inputValue2.trim());
      }
    }
  };

  const handleGenerateDemo = async () => {
    setIsGenerating(true);
    setError(null);
    setError2(null);

    setTimeout(() => {
      if (compareMode === 'single') {
        const mockData = generateMockData();
        useAppStore.setState({
          contributionData: mockData,
          loadingStatus: 'success',
          username: 'demo-user',
        });
      } else {
        generateDemoCompare();
      }
      setIsGenerating(false);
    }, 800);
  };

  const handleClear = () => {
    setInputValue('');
    setInputValue2('');
    clearAll();
    inputRef.current?.focus();
  };

  const hasData = compareMode === 'single' ? contributionData : (contributionData && contributionData2);
  const isLoading = compareMode === 'single'
    ? loadingStatus === 'loading'
    : (loadingStatus === 'loading' || loadingStatus2 === 'loading');

  return (
    <div className="w-full space-y-4">
      <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-zinc-800">
        <button
          type="button"
          onClick={() => handleModeChange('single')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            compareMode === 'single'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>单人模式</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('compare')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            compareMode === 'compare'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>对比模式</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {compareMode === 'compare' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-zinc-500">用户 A</span>
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入 GitHub 用户名，如 torvalds"
                className="w-full px-4 py-3 pl-11 pr-12 text-sm bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                disabled={isLoading || isGenerating}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              {inputValue && !isLoading && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {compareMode === 'compare' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs text-zinc-500">用户 B</span>
            </div>
            <div className="relative">
              <input
                ref={inputRef2}
                type="text"
                value={inputValue2}
                onChange={(e) => setInputValue2(e.target.value)}
                placeholder="输入另一个 GitHub 用户名"
                className="w-full px-4 py-3 pl-11 pr-12 text-sm bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
                disabled={isLoading || isGenerating}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              {inputValue2 && !isLoading && (
                <button
                  type="button"
                  onClick={() => setInputValue2('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {compareMode === 'single' && (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入 GitHub 用户名，如 torvalds"
              className="w-full px-4 py-3 pl-11 pr-12 text-sm bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              disabled={isLoading || isGenerating}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            {inputValue && !isLoading && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={
              (compareMode === 'single' ? !inputValue.trim() : (!inputValue.trim() || !inputValue2.trim())) ||
              isLoading ||
              isGenerating
            }
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>获取中...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{compareMode === 'single' ? '生成贡献图' : '生成对比图'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-zinc-800"></div>
        <span className="text-xs text-zinc-600">或者</span>
        <div className="flex-1 h-px bg-zinc-800"></div>
      </div>

      <button
        type="button"
        onClick={handleGenerateDemo}
        disabled={isLoading || isGenerating}
        className="w-full px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>生成演示数据中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{compareMode === 'single' ? '使用演示数据预览' : '使用演示数据对比'}</span>
          </>
        )}
      </button>

      {hasData && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          重新输入
        </button>
      )}

      <p className="text-xs text-zinc-600 text-center">
        匿名 API 每小时限 60 次，建议添加 Token 以提高限额
      </p>
    </div>
  );
}
