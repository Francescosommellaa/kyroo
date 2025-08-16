import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, ArrowLeft, Zap, Users, Database, Globe, Bot, FileText, Mail, MessageSquare, Workflow } from 'lucide-react';
import { PLAN_CONFIGS, PLAN_COMPARISON, PlanType, getUpgradeCTA } from '../../../shared/plans';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { usePlan } from '../hooks/usePlan';

interface BillingProps {
  targetPlan?: PlanType;
  feature?: string;
}

const Billing: React.FC<BillingProps> = ({ targetPlan, feature }) => {
  const navigate = useNavigate();
  const { currentPlan, isTrialActive, trialDaysLeft } = usePlan();
  const { canUpgrade } = useUsageLimits();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(targetPlan || 'pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (planType: PlanType) => {
    setIsProcessing(true);
    try {
      // Qui andrà l'integrazione con il sistema di pagamento
      console.log(`Upgrading to ${planType} plan`);
      
      // Simulazione chiamata API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect dopo upgrade
      navigate('/dashboard');
    } catch (error) {
      console.error('Errore durante l\'upgrade:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (planType: PlanType) => {
    switch (planType) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Users className="w-6 h-6" />;
      case 'enterprise':
        return <Database className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'workspace': <Database className="w-4 h-4" />,
      'users': <Users className="w-4 h-4" />,
      'web_search': <Globe className="w-4 h-4" />,
      'web_agent': <Bot className="w-4 h-4" />,
      'knowledge_base': <FileText className="w-4 h-4" />,
      'email': <Mail className="w-4 h-4" />,
      'sms': <MessageSquare className="w-4 h-4" />,
      'workflow': <Workflow className="w-4 h-4" />
    };
    return iconMap[feature] || <Check className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna indietro
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Aggiorna il tuo piano
          </h1>
          
          {feature && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-blue-800 font-medium">
                Per utilizzare questa funzionalità, è necessario un piano superiore.
              </p>
            </div>
          )}
          
          {isTrialActive && (
            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-yellow-800 font-medium">
                Trial attivo - {trialDaysLeft} giorni rimanenti
              </p>
            </div>
          )}
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scegli il piano perfetto per le tue esigenze e sblocca tutte le funzionalità di Kyroo.
          </p>
        </div>

        {/* Piano attuale */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Piano attuale</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPlanIcon(currentPlan)}
              <div>
                <h3 className="font-medium text-gray-900 capitalize">{currentPlan}</h3>
                <p className="text-sm text-gray-500">
                  {PLAN_CONFIGS[currentPlan].tagline}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {PLAN_CONFIGS[currentPlan].price === 0 ? 'Gratuito' : `€${PLAN_CONFIGS[currentPlan].price}/mese`}
              </p>
            </div>
          </div>
        </div>

        {/* Piani disponibili */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {Object.entries(PLAN_CONFIGS).map(([planType, config]) => {
            const isCurrentPlan = planType === currentPlan;
            const isRecommended = planType === 'pro';
            const canUpgradeToThis = canUpgrade(planType as PlanType);
            
            return (
              <div
                key={planType}
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
                  selectedPlan === planType
                    ? 'border-blue-500 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  isRecommended ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Consigliato
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      {getPlanIcon(planType as PlanType)}
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {planType}
                      </h3>
                    </div>
                    {isCurrentPlan && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Attuale
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6">{config.tagline}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {config.price === 0 ? 'Gratuito' : `€${config.price}`}
                    </span>
                    {config.price > 0 && (
                      <span className="text-gray-500 ml-2">/mese</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {config.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>