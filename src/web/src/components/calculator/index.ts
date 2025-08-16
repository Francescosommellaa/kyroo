/**
 * Calculator module exports
 * Barrel export for all calculator-related components and utilities
 */

// Components
export { default as CalculatorForm } from './CalculatorForm';
export { default as ResultsDisplay } from './ResultsDisplay';
export { default as QuickCostEstimate } from './QuickCostEstimate';

// Types
export type {
  CostBreakdown,
  PricingRecommendation,
  UsageMetrics,
  CostCalculatorState,
  CostCalculatorProps,
  CalculatorFormProps,
  ResultsDisplayProps,
  QuickEstimateProps,
  CostFactorsProps
} from './calculator-types';

// Utilities
export {
  calculateCostBreakdown,
  hasSignificantCosts,
  calculateUsageMetrics,
  generatePricingRecommendations,
  formatCurrency,
  formatNumber,
  getCategoryColor,
  validateUtilizationRate,
  getCostCategoryStats
} from './calculator-utils';