import { create } from 'zustand';
import type {
  AppState,
  ProcessedData,
  StyleId,
  RateLimitInfo,
  LoadingStatus,
  CompareMode,
} from '../types';
import {
  fetchContributions,
  GitHubApiError,
  validateUsername,
} from '../services/githubApi';
import { processGitHubData, generateMockData } from '../services/dataProcessor';

interface AppStore extends AppState {
  setUsername: (username: string) => void;
  setUsername2: (username: string) => void;
  setCompareMode: (mode: CompareMode) => void;
  setSelectedStyle: (style: StyleId) => void;
  setExportResolution: (resolution: 'hd' | 'fullhd' | 'print') => void;
  fetchData: (username: string, token?: string) => Promise<void>;
  fetchData2: (username: string, token?: string) => Promise<void>;
  fetchBoth: (username1: string, username2: string, token?: string) => Promise<void>;
  generateDemoCompare: () => void;
  clearData: () => void;
  clearData2: () => void;
  clearAll: () => void;
  setError: (message: string | null) => void;
  setError2: (message: string | null) => void;
  setRateLimitInfo: (info: RateLimitInfo | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  username: '',
  username2: '',
  loadingStatus: 'idle',
  loadingStatus2: 'idle',
  contributionData: null,
  contributionData2: null,
  selectedStyle: 'scroll',
  exportResolution: 'fullhd',
  errorMessage: null,
  errorMessage2: null,
  rateLimitInfo: null,
  compareMode: 'single',

  setUsername: (username: string) => {
    set({ username });
  },

  setUsername2: (username: string) => {
    set({ username2: username });
  },

  setCompareMode: (mode: CompareMode) => {
    set({ compareMode: mode });
  },

  setSelectedStyle: (style: StyleId) => {
    set({ selectedStyle: style });
  },

  setExportResolution: (resolution: 'hd' | 'fullhd' | 'print') => {
    set({ exportResolution: resolution });
  },

  fetchData: async (username: string, token?: string) => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      set({
        errorMessage: '请输入 GitHub 用户名',
        loadingStatus: 'error',
      });
      return;
    }

    if (!validateUsername(trimmedUsername)) {
      set({
        errorMessage: '用户名格式不正确，请检查后重试',
        loadingStatus: 'error',
      });
      return;
    }

    set({
      loadingStatus: 'loading',
      errorMessage: null,
      username: trimmedUsername,
    });

    try {
      const { data, rateLimit } = await fetchContributions(
        trimmedUsername,
        token
      );

      const processedData = processGitHubData(data);

      set({
        contributionData: processedData,
        loadingStatus: 'success',
        rateLimitInfo: rateLimit,
      });
    } catch (error) {
      let errorMessage = '获取数据失败，请稍后重试';
      let loadingStatus: LoadingStatus = 'error';

      if (error instanceof GitHubApiError) {
        errorMessage = error.message;
        if (error.rateLimit) {
          set({ rateLimitInfo: error.rateLimit });
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        errorMessage,
        loadingStatus,
        contributionData: null,
      });
    }
  },

  fetchData2: async (username: string, token?: string) => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      set({
        errorMessage2: '请输入 GitHub 用户名',
        loadingStatus2: 'error',
      });
      return;
    }

    if (!validateUsername(trimmedUsername)) {
      set({
        errorMessage2: '用户名格式不正确，请检查后重试',
        loadingStatus2: 'error',
      });
      return;
    }

    set({
      loadingStatus2: 'loading',
      errorMessage2: null,
      username2: trimmedUsername,
    });

    try {
      const { data, rateLimit } = await fetchContributions(
        trimmedUsername,
        token
      );

      const processedData = processGitHubData(data);

      set({
        contributionData2: processedData,
        loadingStatus2: 'success',
        rateLimitInfo: rateLimit || get().rateLimitInfo,
      });
    } catch (error) {
      let errorMessage = '获取数据失败，请稍后重试';
      let loadingStatus: LoadingStatus = 'error';

      if (error instanceof GitHubApiError) {
        errorMessage = error.message;
        if (error.rateLimit) {
          set({ rateLimitInfo: error.rateLimit });
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        errorMessage2: errorMessage,
        loadingStatus2: loadingStatus,
        contributionData2: null,
      });
    }
  },

  fetchBoth: async (username1: string, username2: string, token?: string) => {
    await Promise.all([
      get().fetchData(username1, token),
      get().fetchData2(username2, token),
    ]);
  },

  generateDemoCompare: () => {
    const demo1 = generateMockData();
    const demo2 = generateMockData();
    demo1.username = 'demo-user-1';
    demo1.displayName = '演示用户 A';
    demo2.username = 'demo-user-2';
    demo2.displayName = '演示用户 B';
    set({
      contributionData: demo1,
      contributionData2: demo2,
      loadingStatus: 'success',
      loadingStatus2: 'success',
      username: 'demo-user-1',
      username2: 'demo-user-2',
      compareMode: 'compare',
    });
  },

  clearData: () => {
    set({
      contributionData: null,
      loadingStatus: 'idle',
      errorMessage: null,
    });
  },

  clearData2: () => {
    set({
      contributionData2: null,
      loadingStatus2: 'idle',
      errorMessage2: null,
    });
  },

  clearAll: () => {
    set({
      contributionData: null,
      contributionData2: null,
      loadingStatus: 'idle',
      loadingStatus2: 'idle',
      errorMessage: null,
      errorMessage2: null,
      username: '',
      username2: '',
    });
  },

  setError: (message: string | null) => {
    set({ errorMessage: message });
  },

  setError2: (message: string | null) => {
    set({ errorMessage2: message });
  },

  setRateLimitInfo: (info: RateLimitInfo | null) => {
    set({ rateLimitInfo: info });
  },
}));
