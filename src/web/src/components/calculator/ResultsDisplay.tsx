/**
 * Results Display Component
 * Displays cost calculation results and breakdown
 */

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
} from "lucide-react";
import type { ResultsDisplayProps } from "./calculator-types";
import {
  formatCurrency,
  formatNumber,
  getCategoryColor,
  generatePricingRecommendations,
  getCostCategoryStats,
} from "./calculator-utils";

export default function ResultsDisplay({
  costBreakdown,
  showDetails,
  utilizationRate,
  className = "",
}: ResultsDisplayProps) {
  const pricingRecommendations = generatePricingRecommendations(costBreakdown);
  const categoryStats = getCostCategoryStats(costBreakdown);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Costs */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="text-red-500" size={16} />
            <span className="text-sm font-medium text-red-700">
              Costi Mensili
            </span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(costBreakdown.totalMonthlyCost)}
          </p>
          <p className="text-xs text-red-500 mt-1">
            {formatCurrency(costBreakdown.totalYearlyCost)}/anno
          </p>
        </div>

        {/* Suggested Price */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-green-500" size={16} />
            <span className="text-sm font-medium text-green-700">
              Prezzo Suggerito
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(costBreakdown.suggestedPrice)}
          </p>
          <p className="text-xs text-green-500 mt-1">
            {formatCurrency(costBreakdown.suggestedYearlyPrice)}/anno
          </p>
        </div>

        {/* Profit Margin */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="text-blue-500" size={16} />
            <span className="text-sm font-medium text-blue-700">
              Margine
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {costBreakdown.profitMargin}%
          </p>
          <p className="text-xs text-blue-500 mt-1">
            +{formatCurrency(
              costBreakdown.suggestedPrice - costBreakdown.totalMonthlyCost
            )}/mese
          </p>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      {showDetails && costBreakdown.estimates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Dettaglio Costi per Categoria
          </h4>

          {/* Category Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div
                key={category}
                className="p-3 bg-surface rounded-lg border"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                  >
                    {category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(stats.totalCost)}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {stats.count} servizi
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-3">
            {costBreakdown.estimates.map((estimate, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 bg-surface rounded-lg border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(estimate.category)}`}
                  >
                    {estimate.category}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {estimate.description}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {formatNumber(estimate.estimatedUsage)} {estimate.unit} ×{" "}
                      {formatCurrency(estimate.unitCost)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(estimate.monthlyCost)}
                  </p>
                  <p className="text-xs text-foreground-secondary">/mese</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pricing Recommendations */}
      <div className="p-4 bg-gradient-to-r from-accent-violet/10 to-accent-cyan/10 rounded-xl border border-accent-violet/20">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Raccomandazioni Pricing
        </h4>
        <div className="space-y-2 text-sm text-foreground-secondary">
          {pricingRecommendations.map((rec, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <span className="font-medium">• {rec.title}:</span>{" "}
                <span className="text-foreground-secondary">
                  {rec.description}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-foreground">
                  {formatCurrency(rec.price)}
                </span>
                {rec.savings > 0 && (
                  <p className="text-xs text-green-600">
                    Risparmio: {formatCurrency(rec.savings)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Factors Information */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="text-blue-500 mt-0.5" size={14} />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Fattori di costo considerati:</p>
            <p>
              I costi sono basati sui pricing reali di OpenAI/Claude (AI), Tavily
              (ricerche), Milvus/Zilliz (vector DB), Cohere (embedding), Supabase
              (database/storage). Il tasso di utilizzo del {utilizationRate}%
              rappresenta quanto effettivamente l'utente sfrutterà i limiti
              configurati.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-surface rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {costBreakdown.estimates.length}
          </p>
          <p className="text-xs text-foreground-secondary">Servizi Attivi</p>
        </div>
        <div className="p-3 bg-surface rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {Object.keys(categoryStats).length}
          </p>
          <p className="text-xs text-foreground-secondary">Categorie</p>
        </div>
        <div className="p-3 bg-surface rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {utilizationRate}%
          </p>
          <p className="text-xs text-foreground-secondary">Utilizzo</p>
        </div>
        <div className="p-3 bg-surface rounded-lg">
          <p className="text-lg font-bold text-foreground">
            {costBreakdown.profitMargin}%
          </p>
          <p className="text-xs text-foreground-secondary">ROI</p>
        </div>
      </div>
    </div>
  );
}