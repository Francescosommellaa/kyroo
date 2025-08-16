export interface CostEstimate {
  description: string;
  category: string;
  estimatedUsage: number;
  unit: string;
  unitCost: number;
  monthlyCost: number;
}

export interface CostBreakdown {
  totalMonthlyCost: number;
  totalYearlyCost: number;
  suggestedPrice: number;
  suggestedYearlyPrice: number;
  profitMargin: number;
  estimates: CostEstimate[];
}

export interface PricingRecommendation {
  type: string;
  title: string;
  description: string;
  price: number;
  savings: number;
}

export interface UsageMetrics {
  utilizationRate: number;
  totalEstimates: number;
  activeCategories: number;
  avgCostPerCategory: number;
  monthlyCost: number;
  yearlyCost: number;
}

export interface CostCalculatorState {
  utilizationRate: number;
  showDetails: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CostCalculatorProps {
  className?: string;
  onCostChange?: (cost: number) => void;
}

export interface CalculatorFormProps {
  utilizationRate: number;
  onUtilizationRateChange: (rate: number) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  disabled?: boolean;
  className?: string;
}

export interface ResultsDisplayProps {
  costBreakdown: CostBreakdown;
  showDetails: boolean;
  utilizationRate: number;
  className?: string;
}

export interface QuickEstimateProps {
  onEstimateSelect: (utilizationRate: number) => void;
  onUsageRateChange?: (rate: number, breakdown: CostBreakdown) => void;
  className?: string;
}

export interface CostFactorsProps {
  className?: string;
}