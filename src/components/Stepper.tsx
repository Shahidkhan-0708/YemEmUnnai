import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { playTapSound } from '../lib/celebration';

export interface StepperProps {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  unit?: string;
  prefix?: string;
  className?: string;
  disabled?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  min = 0,
  max = 200,
  value: controlledValue,
  defaultValue = 50,
  step = 1,
  onChange,
  size = 'md',
  unit,
  prefix,
  className = '',
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState<number>(
    controlledValue !== undefined ? controlledValue : defaultValue
  );
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const updateValue = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (controlledValue === undefined) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  };

  const handleDecrement = () => {
    if (disabled || currentValue <= min) return;
    playTapSound();
    updateValue(currentValue - step);
  };

  const handleIncrement = () => {
    if (disabled || currentValue >= max) return;
    playTapSound();
    updateValue(currentValue + step);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleTextClick = () => {
    if (disabled) return;
    setInputValue(String(currentValue));
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      updateValue(parsed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const progressPercent = Math.min(100, Math.max(0, ((currentValue - min) / (max - min || 1)) * 100));

  const sizeClasses = {
    sm: 'h-8 px-1.5 text-xs',
    md: 'h-10 px-2 text-sm',
    lg: 'h-12 px-3 text-base',
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7.5 h-7.5',
    lg: 'w-9 h-9',
  };

  return (
    <div
      tabIndex={0}
      role="spinbutton"
      aria-valuenow={currentValue}
      aria-valuemin={min}
      aria-valuemax={max}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center justify-between rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] select-none transition-all shadow-inner overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#F06A05]/40 ${
        sizeClasses[size]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        boxShadow: 'inset 2px 2px 5px rgba(154,166,179,0.4), inset -2px -2px 5px rgba(255,255,255,0.8)',
      }}
    >
      {/* Background progress indicator subtle fill */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-[#F06A05]/10 transition-all duration-150 pointer-events-none rounded-l-2xl"
        style={{ width: `${progressPercent}%` }}
      />

      {/* Decrement button */}
      <button
        type="button"
        disabled={disabled || currentValue <= min}
        onClick={handleDecrement}
        aria-label="Decrease value"
        className={`relative z-10 rounded-xl bg-white border border-[#D6DCE2] flex items-center justify-center text-[#1F140A] hover:bg-[#F4F6F8] active:scale-90 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
          buttonSizes[size]
        }`}
      >
        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* Center value display / inline edit */}
      <div className="relative z-10 px-3 flex items-center justify-center min-w-16">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-14 text-center font-black text-[#1F140A] bg-transparent outline-none border-b-2 border-[#F06A05]"
          />
        ) : (
          <div
            onClick={handleTextClick}
            title="Click to edit value"
            className="flex items-baseline gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {prefix && <span className="text-xs font-bold text-[#7A6658]">{prefix}</span>}
            <span className="font-black text-[#1F140A] tabular-nums text-sm md:text-base">
              {currentValue}
            </span>
            {unit && <span className="text-xs font-bold text-[#7A6658] ml-0.5">{unit}</span>}
          </div>
        )}
      </div>

      {/* Increment button */}
      <button
        type="button"
        disabled={disabled || currentValue >= max}
        onClick={handleIncrement}
        aria-label="Increase value"
        className={`relative z-10 rounded-xl bg-[#F06A05] text-white flex items-center justify-center hover:bg-[#E05D00] active:scale-90 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
          buttonSizes[size]
        }`}
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </div>
  );
};

export default Stepper;
