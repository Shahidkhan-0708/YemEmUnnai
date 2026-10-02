import React, { useState, useEffect } from 'react';
import { Play, Check, RotateCw } from 'lucide-react';
import { playTapSound, playSuccessChime } from '../lib/celebration';

export interface ActionStep {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface RunActionButtonProps {
  steps: ActionStep[];
  actionLabel?: string;
  onComplete?: () => void;
  className?: string;
  autoResetDuration?: number;
}

export const RunActionButton: React.FC<RunActionButtonProps> = ({
  steps,
  actionLabel = 'Run Action',
  onComplete,
  className = '',
  autoResetDuration = 3500,
}) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (status !== 'running') return;

    if (currentStepIndex < steps.length) {
      const stepDuration = 600 + Math.random() * 300;
      const timer = setTimeout(() => {
        playTapSound();
        setCurrentStepIndex((prev) => prev + 1);
      }, stepDuration);
      return () => clearTimeout(timer);
    } else {
      // Completed all steps
      playSuccessChime();
      setStatus('completed');
      onComplete?.();

      if (autoResetDuration > 0) {
        const resetTimer = setTimeout(() => {
          setStatus('idle');
          setCurrentStepIndex(0);
        }, autoResetDuration);
        return () => clearTimeout(resetTimer);
      }
    }
  }, [status, currentStepIndex, steps.length, onComplete, autoResetDuration]);

  const handleStart = () => {
    if (status === 'running') return;
    playTapSound();
    setCurrentStepIndex(0);
    setStatus('running');
  };

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const StepIcon = currentStep?.icon;
  const progressPercent = steps.length > 0 ? Math.round((currentStepIndex / steps.length) * 100) : 0;

  if (status === 'completed') {
    return (
      <div className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md animate-in zoom-in-95 duration-200 select-none ${className}`}>
        <Check className="w-4 h-4 stroke-[3]" />
        <span>All Actions Completed!</span>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className={`relative inline-flex items-center gap-2.5 h-11 px-4 rounded-xl bg-[#1F140A] text-white text-xs font-bold overflow-hidden shadow-md select-none ${className}`}>
        {/* Progress Fill Bar */}
        <div
          className="absolute inset-y-0 left-0 bg-[#F06A05]/30 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="relative z-10 flex items-center gap-2">
          {StepIcon && <StepIcon className="w-4 h-4 text-[#F06A05] animate-pulse" />}
          <span className="truncate max-w-44">{currentStep?.label}…</span>
        </div>

        <div className="relative z-10 ml-auto flex items-center gap-1.5 pl-2">
          <RotateCw className="w-3.5 h-3.5 animate-spin text-[#F06A05]" />
          <span className="text-[10px] font-mono opacity-80">{progressPercent}%</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#F06A05] hover:bg-[#E05D00] text-white font-extrabold text-xs btn-orange-shadow transition-all duration-150 active:scale-97 cursor-pointer select-none ${className}`}
    >
      <Play className="w-3.5 h-3.5 fill-white" />
      <span>{actionLabel}</span>
    </button>
  );
};

export default RunActionButton;
