/**
 * Cost Calculator Component
 * Displays estimated costs and revenue for Enterprise users
 */

import { useState, useEffect } from "react";
import { Calculator, Info } from "lucide-react";
import type { PlanLimits } from "@kyroo/shared/plans";
import { DEFAULT_UNIT_COSTS, type UnitCosts } from "@kyroo/shared/cost-calculator";
import {
  CalculatorForm,
  ResultsDisplay,
  QuickCostEstimate as QuickEstimate,
  type CostBreakdown
} from "./calculator";
import { calculateCostBreakdown, hasSignificantCosts } from "./calculator/calculator-utils";

interface MainCostCalculatorProps {
  limits: Partial<PlanLimits>;
  className?: string;
}

export default function CostCalculator({
  limits,
  className = "",
}: MainCostCalculatorProps) {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [utilizationRate, setUtilizationRate] = useState(70);
  const [unitCosts] = useState<UnitCosts>(DEFAULT_UNIT_COSTS);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const breakdown = calculateCostBreakdown(utilizationRate / 100, limits, unitCosts);
      setCostBreakdown(breakdown);
    } catch (error) {
      console.error('Error calculating cost breakdown:', error);
      setCostBreakdown(null);
    } finally {
      setIsLoading(false);
    }
  }, [limits, unitCosts, utilizationRate]);

  const handleUsageRateChange = (newRate: number) => {
    setUtilizationRate(newRate);
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isLoading) {
    return (
      <div className={`card-elevated p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-accent-violet border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const significantCosts = costBreakdown ? hasSignificantCosts(costBreakdown) : false;

  return (
    <div className={`card-elevated p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Calculator className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Calcolo Costi/Ricavi
            </h3>
            <p className="text-sm text-foreground-secondary">
              Stima basata sui limiti configurati
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleDetails}
          className="text-sm text-accent-violet hover:text-accent-cyan transition-colors"
        >
          {showDetails ? "Nascondi dettagli" : "Mostra dettagli"}
        </button>
      </div>

      <CalculatorForm
        utilizationRate={utilizationRate}
        onUtilizationRateChange={handleUsageRateChange}
        showDetails={showDetails}
        onToggleDetails={handleToggleDetails}
      />

      {!significantCosts ? (
        <div className="text-center py-8">
          <Info className="mx-auto text-foreground-secondary mb-3" size={32} />
          <p className="text-foreground-secondary">
            Configura i limiti per vedere la stima dei costi
          </p>
        </div>
      ) : (
        costBreakdown && (
          <ResultsDisplay
            costBreakdown={costBreakdown}
            showDetails={showDetails}
            utilizationRate={utilizationRate}
          />
        )
      )}
    </div>
  );
}

// Export the QuickCostEstimate component from the calculator module
export { QuickEstimate as QuickCostEstimate };
