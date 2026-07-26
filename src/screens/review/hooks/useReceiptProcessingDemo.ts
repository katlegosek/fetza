import { useEffect, useMemo, useState } from "react";

import {
  PROCESSING_DEMO_RECEIPT,
  RECEIPT_PROCESSING_STAGES,
  receiptVisibilityForStage,
} from "@/screens/review/receipt-processing-stages";

const REVEAL_DELAY_MS = 1_100;
const STAGE_DURATION_MS = 5_000;

export const useReceiptProcessingDemo = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [currentStageRevealed, setCurrentStageRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    setCurrentStageRevealed(false);

    const revealTimer = setTimeout(() => {
      setCurrentStageRevealed(true);
    }, REVEAL_DELAY_MS);

    const advanceTimer = setTimeout(() => {
      const lastStageIndex = RECEIPT_PROCESSING_STAGES.length - 1;
      if (stageIndex >= lastStageIndex) {
        setCurrentStageRevealed(true);
        setIsComplete(true);
        return;
      }

      setStageIndex((current) => current + 1);
    }, STAGE_DURATION_MS);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(advanceTimer);
    };
  }, [isComplete, stageIndex]);

  const visibleReceiptData = useMemo(
    () => receiptVisibilityForStage(stageIndex, currentStageRevealed),
    [currentStageRevealed, stageIndex],
  );

  const currentStage = RECEIPT_PROCESSING_STAGES[stageIndex];

  return {
    currentStage,
    visibleReceiptData,
    discoveryPill: currentStageRevealed ? currentStage.discoveryPill : null,
    isComplete,
    receipt: PROCESSING_DEMO_RECEIPT,
  };
};
