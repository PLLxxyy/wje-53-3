import type { ProcessedData, StyleConfig, ExportConfig } from '../types';
import { renderToCanvas, renderCompareToCanvas } from './canvasRenderer';

export async function generateHighResImage(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<string> {
  const canvas = document.createElement('canvas');

  await renderToCanvas(canvas, data, style, exportConfig);

  return canvas.toDataURL('image/png', 1.0);
}

export async function generateCompareHighResImage(
  data1: ProcessedData,
  data2: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<string> {
  const canvas = document.createElement('canvas');

  await renderCompareToCanvas(canvas, data1, data2, style, exportConfig);

  return canvas.toDataURL('image/png', 1.0);
}

export async function downloadImage(
  data: ProcessedData | ProcessedData[],
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<void> {
  let dataUrl: string;
  let filename: string;

  if (Array.isArray(data) && data.length === 2) {
    dataUrl = await generateCompareHighResImage(data[0], data[1], style, exportConfig);
    filename = `${data[0].username}-vs-${data[1].username}-compare-${style.id}-${Date.now()}.png`;
  } else {
    const singleData = data as ProcessedData;
    dataUrl = await generateHighResImage(singleData, style, exportConfig);
    filename = `${singleData.username}-contribution-${style.id}-${Date.now()}.png`;
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateBlob(
  data: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderToCanvas(canvas, data, style, exportConfig);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function generateCompareBlob(
  data1: ProcessedData,
  data2: ProcessedData,
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderCompareToCanvas(canvas, data1, data2, style, exportConfig);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate compare image blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export function estimateFileSize(
  exportConfig: ExportConfig,
  data: ProcessedData | ProcessedData[]
): string {
  let width: number;
  let daysCount: number;

  if (Array.isArray(data) && data.length === 2) {
    width = exportConfig.width * 2 + 60;
    daysCount = Math.max(data[0].days.length, data[1].days.length);
  } else {
    width = exportConfig.width;
    daysCount = (data as ProcessedData).days.length;
  }

  const layoutWeeks = Math.ceil(daysCount / 7);
  const gridWidth = layoutWeeks * (exportConfig.cellSize + exportConfig.cellGap);
  const gridHeight = 7 * (exportConfig.cellSize + exportConfig.cellGap);
  const totalHeight =
    exportConfig.padding.top + 180 + gridHeight + 280 + exportConfig.padding.bottom;

  const pixels = width * totalHeight;
  const bytesPerPixel = 4;
  const estimatedBytes = pixels * bytesPerPixel * 0.3;

  if (estimatedBytes < 1024 * 1024) {
    return `${(estimatedBytes / 1024).toFixed(0)} KB`;
  }
  return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function copyImageToClipboard(
  data: ProcessedData | ProcessedData[],
  style: StyleConfig,
  exportConfig: ExportConfig
): Promise<boolean> {
  try {
    let blob: Blob;

    if (Array.isArray(data) && data.length === 2) {
      blob = await generateCompareBlob(data[0], data[1], style, exportConfig);
    } else {
      blob = await generateBlob(data as ProcessedData, style, exportConfig);
    }

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
