/**
 * Cost Calculator Component
 * Displays estimated costs and revenue for Enterprise users
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import type { PlanLimits } from '../../../shared/plans';
import { 
  calculateEnterpriseCosts, 
  formatCurrency, 
  formatNumber, 
  getCategoryColor,
  DEFAULT_UNIT_COSTS,
  type CostBreakdown,
  type UnitCosts
} from '../../../shared/cost-calculator';

interface CostCalculatorProps {
  limits: Partial<PlanLimits>;
  className?: string;
}

export default function CostCalculator({ limits, className = '' }: CostCalculatorProps) {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [utilizationRate, setUtilizationRate] = useState(70); // 70% default
  const [unitCosts, setUnitCosts] = useState<UnitCosts>(DEFAULT_UNIT_COSTS);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const breakdown = calculateEnterpriseCosts(limits, unitCosts, utilizationRate / 100);
    setCostBreakdown(breakdown);
  }, [limits, unitCosts, utilizationRate]);

  if (!costBreakdown) {
    return (
      <div className={`card-elevated p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-accent-violet border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasSignificantCosts = costBreakdown.totalMonthlyCost > 0.01;

  return (
    <div className={`card-elevated p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Calculator className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Calcolo Costi/Ricavi</h3>
            <p className="text-sm text-foreground-secondary">Stima basata sui limiti configurati</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-accent-violet hover:text-accent-cyan transition-colors"
        >
          {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
        </button>
      </div>

      {/* Utilization Rate Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Tasso di Utilizzo Stimato
          </label>
          <span className="text-sm text-foreground-secondary">{utilizationRate}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={utilizationRate}
          onChange={(e) => setUtilizationRate(Number(e.target.value))}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-foreground-secondary mt-1">
          <span>10%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {!hasSignificantCosts ? (
        <div className="text-center py-8">
          <Info className="mx-auto text-foreground-secondary mb-3" size={32} />
          <p className="text-foreground-secondary">
            Configura i limiti per vedere la stima dei costi
          </p>
        </div>
      ) : (
        <>
          {/* Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="text-red-500" size={16} />
                <span className="text-sm font-medium text-red-700">Costi Mensili</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(costBreakdown.totalMonthlyCost)}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {formatCurrency(costBreakdown.totalYearlyCost)}/anno
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-sm font-medium text-green-700">Prezzo Suggerito</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(costBreakdown.suggestedPrice)}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {formatCurrency(costBreakdown.suggestedYearlyPrice)}/anno
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="text-blue-500" size={16} />
                <span className="text-sm font-medium text-blue-700">Margine</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {costBreakdown.profitMargin}%
              </p>
              <p className="text-xs text-blue-500 mt-1">
                +{formatCurrency(costBreakdown.suggestedPrice - costBreakdown.totalMonthlyCost)}/mese
              </p>
            </div>
          </div>

          {/* Cost Breakdown Details */}
          {showDetails && costBreakdown.estimates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">Dettaglio Costi</h4>
              
              {costBreakdown.estimates.map((estimate, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-surface rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(estimate.category)}`}>
                      {estimate.category}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {estimate.description}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {formatNumber(estimate.estimatedUsage)} {estimate.unit} × {formatCurrency(estimate.unitCost)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(estimate.monthlyCost)}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      /mese
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pricing Recommendations */}
          <div className="mt-6 p-4 bg-gradient-to-r from-accent-violet/10 to-accent-cyan/10 rounded-xl border border-accent-violet/20">
            <h4 className="text-sm font-semibold text-foreground mb-2">Raccomandazioni Pricing</h4>
            <div className="space-y-2 text-sm text-foreground-secondary">
              <p>
                • <strong>Prezzo base:</strong> {formatCurrency(costBreakdown.totalMonthlyCost)} 
                (copertura costi operativi)
              </p>
              <p>
                • <strong>Prezzo consigliato:</strong> {formatCurrency(costBreakdown.suggestedPrice)} 
                (margine {costBreakdown.profitMargin}%)
              </p>
              <p>
                • <strong>Sconto annuale:</strong> {formatCurrency(costBreakdown.suggestedYearlyPrice)} 
                (risparmio di {formatCurrency((costBreakdown.suggestedPrice * 12) - costBreakdown.suggestedYearlyPrice)})
              </p>
            </div>
          </div>

          {/* Cost Factors Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="text-blue-500 mt-0.5" size={14} />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Fattori di costo considerati:</p>
                <p>
                  I costi sono basati sui pricing reali di OpenAI/Claude (AI), Tavily (ricerche), 
                  Milvus/Zilliz (vector DB), Cohere (embedding), Supabase (database/storage). 
                  Il tasso di utilizzo rappresenta quanto effettivamente l'utente sfrutterà i limiti configurati.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Preset component for quick cost estimation
export function QuickCostEstimate({ limits }: { limits: Partial<PlanLimits> }) {
  const costBreakdown = calculateEnterpriseCosts(limits, DEFAULT_UNIT_COSTS, 0.7);
  
  if (costBreakdown.totalMonthlyCost < 0.01) {
    return (
      <div className="text-xs text-foreground-secondary">
        Configura i limiti per vedere i costi
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="text-red-600">
        <span className="font-medium">Costi:</span> {formatCurrency(costBreakdown.totalMonthlyCost)}/mese
      </div>
      <div className="text-green-600">
        <span className="font-medium">Ricavi:</span> {formatCurrency(costBreakdown.suggestedPrice)}/mese
      </div>
      <div className="text-blue-600">
        <span className="font-medium">Margine:</span> {costBreakdown.profitMargin}%
      </div>
    </div>
  );
}

