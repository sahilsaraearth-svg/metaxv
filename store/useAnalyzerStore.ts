'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisResult, HistoryItem, Platform } from '@/lib/types';

interface AnalyzerState {
  url: string;
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  selectedPlatform: Platform;
  history: HistoryItem[];

  setUrl: (url: string) => void;
  setResult: (result: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPlatform: (platform: Platform) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  reset: () => void;
}

export const useAnalyzerStore = create<AnalyzerState>()(
  persist(
    (set) => ({
      url: '',
      result: null,
      loading: false,
      error: null,
      selectedPlatform: 'google',
      history: [],

      setUrl: (url) => set({ url }),
      setResult: (result) => set({ result }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
      addToHistory: (item) =>
        set((state) => {
          const filtered = state.history.filter((h) => h.url !== item.url);
          return { history: [item, ...filtered].slice(0, 10) };
        }),
      clearHistory: () => set({ history: [] }),
      reset: () => set({ result: null, error: null, loading: false }),
    }),
    {
      name: 'metaxv-store',
      partialize: (state) => ({
        history: state.history,
        selectedPlatform: state.selectedPlatform,
      }),
    }
  )
);
