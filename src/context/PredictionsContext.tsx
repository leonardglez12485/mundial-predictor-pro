import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MOCK_MATCHES } from "@/lib/mockData";
import type { Match, Prediction } from "@/lib/types";

interface PredictionsState {
  matches: Match[];
  predictions: Prediction[];
  getPrediction: (matchId: string, userId: string) => Prediction | undefined;
  savePrediction: (p: Prediction) => void;
}

const PredictionsContext = createContext<PredictionsState | null>(null);
const STORAGE_PREDS = "prode_predictions";

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const [predictions, setPredictions] = useState<Prediction[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_PREDS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_PREDS, JSON.stringify(predictions));
  }, [predictions]);

  const getPrediction = (matchId: string, userId: string) =>
    predictions.find(p => p.matchId === matchId && p.userId === userId);

  const savePrediction = (p: Prediction) => {
    setPredictions(prev => {
      const idx = prev.findIndex(x => x.matchId === p.matchId && x.userId === p.userId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = p;
        return copy;
      }
      return [...prev, p];
    });
  };

  return (
    <PredictionsContext.Provider value={{ matches: MOCK_MATCHES, predictions, getPrediction, savePrediction }}>
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const ctx = useContext(PredictionsContext);
  if (!ctx) throw new Error("usePredictions must be used inside PredictionsProvider");
  return ctx;
}
