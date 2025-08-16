/**
 * Calculator Form Component
 * Handles input controls for the cost calculator
 */

import { useState, useCallback } from "react";
import { Info } from "lucide-react";
import type { CalculatorFormProps } from "./calculator-types";
import {
  validateUtilizationRate,
  getUtilizationRateColor,
} from './calculator-utils';

export default function CalculatorForm({
  utilizationRate,
  onUtilizationRateChange,
  showDetails,
  onToggleDetails,
  disabled = false,
  className = "",
}: CalculatorFormProps) {
  const [inputError, setInputError] = useState<string | null>(null);

  const handleUtilizationChange = useCallback(
    (value: number) => {
      const validation = validateUtilizationRate(value);
      
      if (!validation.isValid) {
        setInputError(validation.error || null);
        return;
      }

      setInputError(null);
      onUtilizationRateChange(value);
    },
    [onUtilizationRateChange]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      handleUtilizationChange(value);
    },
    [handleUtilizationChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (!isNaN(value)) {
        handleUtilizationChange(value);
      }
    },
    [handleUtilizationChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with toggle details button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-foreground">
            Configurazione Calcolo
          </h4>
          {inputError && (
            <div className="flex items-center space-x-1 text-red-500">
              <Info size={12} />
              <span className="text-xs">{inputError}</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleDetails}
          disabled={disabled}
          className="text-sm text-accent-violet hover:text-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showDetails ? "Nascondi dettagli" : "Mostra dettagli"}
        </button>
      </div>

      {/* Utilization Rate Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Tasso di Utilizzo Stimato
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="10"
              max="100"
              step="5"
              value={utilizationRate}
              onChange={handleInputChange}
              disabled={disabled}
              className={`w-16 px-2 py-1 text-xs border rounded text-center ${
                inputError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <span
              className={`text-sm font-medium ${
                inputError
                  ? "text-red-500"
                  : getUtilizationRateColor(utilizationRate)
              }`}
            >
              %
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={utilizationRate}
            onChange={handleSliderChange}
            disabled={disabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${
              inputError
                ? "bg-red-200"
                : "bg-surface"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          
          {/* Slider labels */}
          <div className="flex justify-between text-xs text-foreground-secondary">
            <span>10%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Utilization Rate Description */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="text-blue-500 mt-0.5" size={14} />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">
                Cos'è il tasso di utilizzo?
              </p>
              <p>
                Rappresenta quanto effettivamente l'utente sfrutterà i limiti
                configurati. Un tasso del 70% significa che l'utente utilizzerà
                in media il 70% delle risorse disponibili nel piano.
              </p>
            </div>
          </div>
        </div>

        {/* Utilization Rate Recommendations */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
            <div className="font-medium text-red-700">Basso</div>
            <div className="text-red-600">10-30%</div>
            <div className="text-red-500 mt-1">Utenti occasionali</div>
          </div>
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
            <div className="font-medium text-yellow-700">Medio</div>
            <div className="text-yellow-600">30-70%</div>
            <div className="text-yellow-500 mt-1">Utenti regolari</div>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
            <div className="font-medium text-green-700">Alto</div>
            <div className="text-green-600">70-100%</div>
            <div className="text-green-500 mt-1">Utenti intensivi</div>
          </div>
        </div>
      </div>
    </div>
  );
}