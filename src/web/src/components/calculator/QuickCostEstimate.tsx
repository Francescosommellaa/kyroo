import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { QuickEstimateProps } from './calculator-types';
import { 
  calculateCostBreakdown, 
  formatCurrency, 
  validateUtilizationRate 
} from './calculator-utils';

interface QuickEstimateState {
  usageRate: number;
  estimatedRevenue: number;
  showDetails: boolean;
  errors: {
    usageRate?: string;
    revenue?: string;
  };
}

const QuickCostEstimate: React.FC<QuickEstimateProps> = ({
  onUsageRateChange,
  className = ''
}) => {
  const [state, setState] = useState<QuickEstimateState>({
    usageRate: 50,
    estimatedRevenue: 10000,
    showDetails: false,
    errors: {}
  });

  const [costBreakdown, setCostBreakdown] = useState(calculateCostBreakdown(50 / 100));

  // Calcola i costi quando cambia il tasso di utilizzo
  useEffect(() => {
    const costBreakdown = calculateCostBreakdown(state.usageRate / 100);
    setCostBreakdown(costBreakdown);
    
    // Notifica il componente padre del cambio
    if (onUsageRateChange) {
      onUsageRateChange?.(state.usageRate, costBreakdown);
    }
  }, [state.usageRate, onUsageRateChange]);

  const handleUsageRateChange = (value: number) => {
    const validation = validateUtilizationRate(value);
    
    setState(prev => ({
      ...prev,
      usageRate: value,
      errors: {
        ...prev.errors,
        usageRate: validation.isValid ? undefined : validation.error
      }
    }));
  };

  const handleRevenueChange = (value: number) => {
    const isValid = value >= 0 && value <= 1000000;
    
    setState(prev => ({
      ...prev,
      estimatedRevenue: value,
      errors: {
        ...prev.errors,
        revenue: isValid ? undefined : 'Il ricavo deve essere tra 0 e 1.000.000'
      }
    }));
  };

  const toggleDetails = () => {
    setState(prev => ({ ...prev, showDetails: !prev.showDetails }));
  };

  // Calcoli derivati
  const monthlyCost = costBreakdown.totalMonthlyCost;
  const margin = state.estimatedRevenue - monthlyCost;
  const marginPercentage = state.estimatedRevenue > 0 
    ? (margin / state.estimatedRevenue) * 100 
    : 0;

  const getMarginColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMarginStatus = (percentage: number) => {
    if (percentage >= 70) return 'Eccellente';
    if (percentage >= 50) return 'Buono';
    if (percentage >= 30) return 'Accettabile';
    return 'Critico';
  };

  return (
    <div className={`w-full bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Stima Rapida dei Costi
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="quick-usage-rate" className="block text-sm font-medium text-gray-700">Tasso di Utilizzo (%)</label>
            <input
              id="quick-usage-rate"
              type="number"
              min="0"
              max="100"
              value={state.usageRate}
              onChange={(e) => handleUsageRateChange(Number(e.target.value))}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                state.errors.usageRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {state.errors.usageRate && (
              <p className="text-sm text-red-600">{state.errors.usageRate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="estimated-revenue" className="block text-sm font-medium text-gray-700">Ricavo Stimato (€/mese)</label>
            <input
              id="estimated-revenue"
              type="number"
              min="0"
              max="1000000"
              value={state.estimatedRevenue}
              onChange={(e) => handleRevenueChange(Number(e.target.value))}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                state.errors.revenue ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {state.errors.revenue && (
              <p className="text-sm text-red-600">{state.errors.revenue}</p>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Costo Mensile</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(monthlyCost)}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Margine</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(margin)}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-800">Margine %</span>
            </div>
            <p className={`text-2xl font-bold ${getMarginColor(marginPercentage)}`}>
              {marginPercentage.toFixed(1)}%
            </p>
            <p className={`text-sm ${getMarginColor(marginPercentage)}`}>
              {getMarginStatus(marginPercentage)}
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <div className="flex justify-center">
          <button 
            onClick={toggleDetails}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {state.showDetails ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
          </button>
        </div>

        {/* Detailed Breakdown */}
        {state.showDetails && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-gray-900">Dettaglio Costi per Categoria</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {costBreakdown.estimates.map((estimate, index) => {
                if (estimate.monthlyCost <= 0) return null;
                
                const percentage = (estimate.monthlyCost / monthlyCost) * 100;
                
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium capitalize">
                      {estimate.category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold">{formatCurrency(estimate.monthlyCost)}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                 );
               })}
            </div>
            
            {/* Quick Recommendations */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">Raccomandazioni Rapide</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {marginPercentage < 30 && (
                  <li>• Considera di aumentare i prezzi o ottimizzare i costi</li>
                )}
                {state.usageRate > 80 && (
                  <li>• Alto utilizzo: valuta piani di scaling automatico</li>
                )}
                {state.usageRate < 20 && (
                  <li>• Basso utilizzo: considera piani più economici</li>
                )}
                {monthlyCost > state.estimatedRevenue && (
                  <li>• ⚠️ I costi superano i ricavi stimati</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickCostEstimate;