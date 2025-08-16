/**
 * Calculator Utilities
 * Utility functions for cost calculations and formatting
 */

import type { PlanLimits } from "../../../../shared/plans";
import {
  calculateEnterpriseCosts,
  formatCurrency,
  formatNumber,
  getCategoryColor,
  DEFAULT_UNIT_COSTS,
  type CostBreakdown,
  type UnitCosts,
} from "../../../../shared/cost-calculator";
import type { UsageMetrics, PricingRecommendation } from "./calculator-types";

/**
 * Calculate cost breakdown with utilization rate
 */
export function calculateCostBreakdown(
  utilizationRate: number = 0.7,
  limits: Partial<PlanLimits> = {},
  unitCosts: UnitCosts = DEFAULT_UNIT_COSTS
): CostBreakdown {
  return calculateEnterpriseCosts(limits, unitCosts, utilizationRate);
}

/**
 * Check if costs are significant enough to display
 */
export function hasSignificantCosts(costBreakdown: CostBreakdown): boolean {
  return costBreakdown.totalMonthlyCost > 0.01;
}

/**
 * Calculate usage metrics from cost breakdown
 */
export function calculateUsageMetrics(
  costBreakdown: CostBreakdown,
  utilizationRate: number
): UsageMetrics {
  const totalEstimates = costBreakdown.estimates.length;
  const activeCategories = new Set(
    costBreakdown.estimates.map(e => e.category)
  ).size;
  
  const avgCostPerCategory = totalEstimates > 0 
    ? costBreakdown.totalMonthlyCost / activeCategories
    : 0;

  return {
    utilizationRate,
    totalEstimates,
    activeCategories,
    avgCostPerCategory,
    monthlyCost: costBreakdown.totalMonthlyCost,
    yearlyCost: costBreakdown.totalYearlyCost,
  };
}

/**
 * Generate pricing recommendations
 */
export function generatePricingRecommendations(
  costBreakdown: CostBreakdown
): PricingRecommendation[] {
  const recommendations: PricingRecommendation[] = [];

  // Base cost recommendation
  recommendations.push({
    type: "base",
    title: "Prezzo base",
    description: "Copertura costi operativi",
    price: costBreakdown.totalMonthlyCost,
    savings: 0,
  });

  // Suggested price recommendation
  recommendations.push({
    type: "suggested",
    title: "Prezzo consigliato",
    description: `Margine ${costBreakdown.profitMargin}%`,
    price: costBreakdown.suggestedPrice,
    savings: 0,
  });

  // Annual discount recommendation
  const annualSavings = costBreakdown.suggestedPrice * 12 - costBreakdown.suggestedYearlyPrice;
  recommendations.push({
    type: "annual",
    title: "Sconto annuale",
    description: "Piano annuale con sconto",
    price: costBreakdown.suggestedYearlyPrice,
    savings: annualSavings,
  });

  return recommendations;
}

/**
 * Format utilization rate for display
 */
export function formatUtilizationRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Get utilization rate color based on value
 */
export function getUtilizationRateColor(rate: number): string {
  if (rate < 30) return "text-red-500";
  if (rate < 70) return "text-yellow-500";
  return "text-green-500";
}

/**
 * Calculate profit margin from costs and price
 */
export function calculateProfitMargin(cost: number, price: number): number {
  if (cost === 0) return 0;
  return Math.round(((price - cost) / cost) * 100);
}

/**
 * Get cost trend indicator
 */
export function getCostTrend(currentCost: number, previousCost: number): {
  trend: "up" | "down" | "stable";
  percentage: number;
} {
  if (previousCost === 0) {
    return { trend: "stable", percentage: 0 };
  }

  const change = ((currentCost - previousCost) / previousCost) * 100;
  
  if (Math.abs(change) < 1) {
    return { trend: "stable", percentage: 0 };
  }

  return {
    trend: change > 0 ? "up" : "down",
    percentage: Math.abs(change),
  };
}

/**
 * Validate utilization rate input
 */
export function validateUtilizationRate(rate: number): {
  isValid: boolean;
  error?: string;
} {
  if (rate < 10) {
    return {
      isValid: false,
      error: "Il tasso di utilizzo deve essere almeno del 10%",
    };
  }

  if (rate > 100) {
    return {
      isValid: false,
      error: "Il tasso di utilizzo non può superare il 100%",
    };
  }

  return { isValid: true };
}

/**
 * Get cost category statistics
 */
export function getCostCategoryStats(costBreakdown: CostBreakdown) {
  const categories = costBreakdown.estimates.reduce((acc, estimate) => {
    const category = estimate.category;
    if (!acc[category]) {
      acc[category] = {
        totalCost: 0,
        count: 0,
        avgCost: 0,
      };
    }
    acc[category].totalCost += estimate.monthlyCost;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { totalCost: number; count: number; avgCost: number }>);

  // Calculate average costs
  Object.keys(categories).forEach(category => {
    categories[category].avgCost = categories[category].totalCost / categories[category].count;
  });

  return categories;
}

/**
 * Export commonly used formatting functions
 */
export { formatCurrency, formatNumber, getCategoryColor };