import React, { useState } from 'react';
import { Check, Crown, Zap, Users, Database, Globe, Mail, MessageSquare, FileText, ArrowRight, CreditCard, Calendar } from 'lucide-react';
import { PLAN_CONFIGS, PLAN_COMPARISON, PlanType, getPlanConfig, formatLimit } from '../shared/plans';
import { useUsageLimits } from '../hooks/useUsageLimits';

interface BillingProps {
  currentPlan?: PlanType;
  currentUsage?: {
    workspaces: number;
    users: number;
    collaborators: number;
    filesThisMonth: number;
    emailsThisMonth: number;
    smsThisMonth: number;
    webSearchesToday: number;
  };
}

const Billing: React.FC<BillingProps> = ({ 
  currentPlan = 'free',
  currentUsage = {
    workspaces: 1,
    users: 1,
    collaborators: 0,
    filesThisMonth: 15,
    emailsThisMonth: 5,
    smsThisMonth: 0,
    webSearchesToday: 3
  }
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { checkPlanActive } = useUsageLimits();

  const currentPlanConfig = getPlanConfig(currentPlan);
  const isTrialActive = checkPlanActive();

  const handleUpgrade = (planType: PlanType) => {
    // Placeholder per integrazione pagamento
    console.log(`Upgrading to ${planType} plan`);
    // Qui andrà l'integrazione con Stripe/PayPal
  };

  const UsageBar = ({ current, limit, label }: { current: number; limit: number | 'unlimited'; label: string }) => {
    if (limit === 'unlimited') {
      return (
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-green-600">Illimitato</span>
        </div>
      );
    }

    const percentage = Math.min((current / limit) * 100, 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;

    return (
      <div className="py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className={`text-sm font-medium ${
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {current} / {formatLimit(limit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const PlanCard = ({ planType, isCurrentPlan }: { planType: PlanType; isCurrentPlan: boolean }) => {
    const config = getPlanConfig(planType);
    const comparison = PLAN_COMPARISON.find(p => p.plan === planType);
    
    if (!config || !comparison) return null;

    const price = billingCycle === 'yearly' ? config.yearlyPrice : config.monthlyPrice;
    const isPopular = planType === 'pro';

    return (
      <div className={`relative rounded-2xl border-2 p-6 ${
        isCurrentPlan 
          ? 'border-blue-500 bg-blue-50' 
          : isPopular 
          ? 'border-purple-500 bg-white shadow-lg' 
          : 'border-gray-200 bg-white'
      }`}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Più Popolare
            </span>
          </div>
        )}
        
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Piano Attuale
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {planType === 'free' && <Zap className="h-8 w-8 text-blue-500" />}
            {planType === 'pro' && <Crown className="h-8 w-8 text-purple-500" />}
            {planType === 'enterprise' && <Database className="h-8 w-8 text-gray-700" />}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{config.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{config.tagline}</p>
          
          <div className="mb-4">
            {price === 0 ? (
              <span className="text-3xl font-bold text-gray-900">Gratis</span>
            ) : planType === 'enterprise' ? (
              <span className="text-3xl font-bold text-gray-900">Personalizzato</span>
            ) : (
              <div>
                <span className="text-3xl font-bold text-gray-900">€{price}</span>
                <span className="text-gray-600 ml-1">/{billingCycle === 'yearly' ? 'anno' : 'mese'}</span>
                {billingCycle === 'yearly' && config.monthlyPrice > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Risparmi €{(config.monthlyPrice * 12 - config.yearlyPrice).toFixed(0)}/anno
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Workspace</span>
            <span className="font-medium">{comparison.workspaces}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Utenti</span>
            <span className="font-medium">{comparison.users}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">File/mese</span>
            <span className="font-medium">{comparison.files}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email/mese</span>
            <span className="font-medium">{comparison.emails}</span>
          </div>
        </div>

        <button
          onClick={() => handleUpgrade(planType)}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : planType === 'pro'
              ? 'bg-purple-500 hover