/**
 * Plan Badge Component
 * Displays user's current plan with appropriate styling and icon
 */

import { Star, Shield, Check } from 'lucide-react';
import type { PlanType } from '../../../shared/plans';

interface PlanBadgeProps {
  planType: PlanType;
  isTrialPro?: boolean;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const planConfig = {
  free: {
    label: 'Free',
    icon: Check,
    colors: 'bg-gray-100 text-gray-700 border-gray-200',
    darkColors: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  },
  pro: {
    label: 'Pro',
    icon: Star,
    colors: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-transparent',
    darkColors: '',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Shield,
    colors: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-transparent',
    darkColors: '',
  },
};

export default function PlanBadge({
  planType,
  isTrialPro = false,
  className = '',
  showIcon = true,
  size = 'sm',
}: PlanBadgeProps) {
  const config = planConfig[planType];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  // For free plan, use simple styling
  if (planType === 'free') {
    return (
      <div className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${config.colors} ${config.darkColors}
        ${sizeClasses[size]}
        ${className}
      `}>
        {showIcon && <Icon size={iconSizes[size]} />}
        <span>{config.label}</span>
      </div>
    );
  }

  // For Pro and Enterprise, use gradient styling
  return (
    <div className={`
      inline-flex items-center space-x-1 rounded-full font-medium shadow-sm
      ${config.colors}
      ${sizeClasses[size]}
      ${className}
    `}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>
        {config.label}
        {isTrialPro && planType === 'pro' && ' Trial'}
      </span>
    </div>
  );
}

// Preset components for common use cases
export function SidebarPlanBadge({ planType, isTrialPro }: { planType: PlanType; isTrialPro?: boolean }) {
  return (
    <PlanBadge
      planType={planType}
      isTrialPro={isTrialPro}
      size="sm"
      className="mt-1"
    />
  );
}

export function HeaderPlanBadge({ planType, isTrialPro }: { planType: PlanType; isTrialPro?: boolean }) {
  return (
    <PlanBadge
      planType={planType}
      isTrialPro={isTrialPro}
      size="md"
    />
  );
}

