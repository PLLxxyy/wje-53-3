import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getStyleConfig, getExportConfig } from '../config/styles';
import { renderToCanvas, renderCompareToCanvas } from '../services/canvasRenderer';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';

export function PreviewCanvas() {
  const {
    contributionData,
    contributionData2,
    selectedStyle,
    loadingStatus,
    loadingStatus2,
    compareMode,
    errorMessage,
    errorMessage2,
  } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoom, setZoom] = useState(0.4);

  useEffect(() => {
    if (compareMode === 'single') {
      if (loadingStatus !== 'success' || !contributionData) return;
    } else {
      if (loadingStatus !== 'success' || loadingStatus2 !== 'success' || !contributionData || !contributionData2) return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = async () => {
      setIsRendering(true);
      try {
        const style = getStyleConfig(selectedStyle);
        const baseConfig = getExportConfig('hd');

        const containerWidth = containerRef.current?.clientWidth || 800;
        const effectiveWidth = compareMode === 'compare' ? baseConfig.width * 2 + 60 : baseConfig.width;
        const scale = Math.min(zoom, (containerWidth - 40) / effectiveWidth);

        const scaledConfig = {
          ...baseConfig,
          width: Math.floor(baseConfig.width * scale),
          cellSize: Math.floor(baseConfig.cellSize * scale),
          cellGap: Math.floor(baseConfig.cellGap * scale),
          padding: {
            top: Math.floor(baseConfig.padding.top * scale),
            right: Math.floor(baseConfig.padding.right * scale),
            bottom: Math.floor(baseConfig.padding.bottom * scale),
            left: Math.floor(baseConfig.padding.left * scale),
          },
        };

        if (compareMode === 'compare' && contributionData && contributionData2) {
          await renderCompareToCanvas(canvas, contributionData, contributionData2, style, scaledConfig);
        } else if (contributionData) {
          await renderToCanvas(canvas, contributionData, style, scaledConfig);
        }
      } catch (error) {
        console.error('Render error:', error);
      } finally {
        setIsRendering(false);
      }
    };

    render();
  }, [contributionData, contributionData2, selectedStyle, zoom, compareMode, loadingStatus, loadingStatus2]);

  const isLoading = compareMode === 'single'
    ? loadingStatus === 'loading'
    : (loadingStatus === 'loading' || loadingStatus2 === 'loading');

  const isError = compareMode === 'single'
    ? loadingStatus === 'error'
    : (loadingStatus === 'error' || loadingStatus2 === 'error');

  const isIdle = compareMode === 'single'
    ? loadingStatus === 'idle'
    : (loadingStatus === 'idle' && loadingStatus2 === 'idle');

  const isSuccess = compareMode === 'single'
    ? loadingStatus === 'success'
    : (loadingStatus === 'success' && loadingStatus2 === 'success');

  if (isIdle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 border-dashed p-8">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-lg font-medium text-zinc-300 mb-2">
          等待生成贡献图
        </h3>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          输入 GitHub 用户名，或使用演示数据，即可生成专属的代码贡献艺术长图
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 p-8">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-zinc-300 mb-2">
          正在获取数据...
        </h3>
        <p className="text-sm text-zinc-500">
          {compareMode === 'compare' ? '正在获取两位用户的贡献数据中，请稍候' : '从 GitHub API 获取贡献数据中，请稍候'}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 rounded-lg border border-red-900/50 p-8">
        <div className="text-6xl mb-4">😔</div>
        <h3 className="text-lg font-medium text-red-400 mb-2">获取数据失败</h3>
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          {errorMessage || errorMessage2 || '请检查用户名或网络连接后重试'}
        </p>
      </div>
    );
  }

  const style = getStyleConfig(selectedStyle);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: style.accentColor }}
          />
          <span className="text-sm font-medium text-zinc-300">
            {style.name} 风格预览 {compareMode === 'compare' && '· 对比模式'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom(Math.max(0.2, zoom - 0.05))}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(1, zoom + 0.05))}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 bg-zinc-900/30"
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded shadow-2xl"
            style={{
              boxShadow: `0 25px 50px -12px ${style.accentColor}20`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
