/**
 * Usage Bar Component
 * Displays usage progress with visual indicator
 */

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { isUnlimited, formatLimit } from '@kyroo/shared/plans';

interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number; // Percentage threshold for warning (default 80%)
}

export default function UsageBar({
  label,
  current,
  limit,
  unit = '',
  className = '',
  showWarning = true,
  warningThreshold = 80,
}: UsageBarProps) {
  const unlimited = isUnlimited(limit);
  const percentage = unlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isOverLimit = !unlimited && current > limit;
  const isNearLimit = !unlimited && percentage >= warningThreshold;
  
  const getStatusColor = () => {
    if (unlimited) return 'text-blue-500';
    if (isOverLimit) return 'text-red-500';
    if (isNearLimit) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBarColor = () => {
    if (unlimited) return 'bg-blue-500';
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (unlimited) return null;
    if (isOverLimit) return <XCircle size={16} className="text-red-500" />;
    if (isNearLimit && showWarning) return <AlertTriangle size={16} className="text-yellow-500" />;
    return <CheckCircle size={16} className="text-green-500" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {getStatusIcon()}
        </div>
        
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {unlimited ? (
            <span>Illimitato</span>
          ) : (
            <span>
              {current.toLocaleString()}{unit} / {formatLimit(limit)}{unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!unlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Status message */}
      {!unlimited && (
        <div className="text-xs text-foreground-secondary">
          {isOverLimit ? (
            <span className="text-red-600">
              Limite superato di {(current - limit).toLocaleString()}{unit}
            </span>
          ) : isNearLimit && showWarning ? (
            <span className="text-yellow-600">
              Attenzione: {(limit - current).toLocaleString()}{unit} rimanenti
            </span>
          ) : (
            <span>
              {(limit - current).toLocaleString()}{unit} rimanenti
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Preset usage bars for common metrics
export function WorkspaceUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="Workspace"
      current={current}
      limit={limit}
      className={className}
    />
  );
}

export function WebSearchUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="Ricerche web oggi"
      current={current}
      limit={limit}
      className={className}
    />
  );
}

export function FileUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="File questo mese"
      current={current}
      limit={limit}
      className={className}
    />
  );
}

export function ChatUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="Chat attive"
      current={current}
      limit={limit}
      className={className}
    />
  );
}

export function KnowledgeBaseUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="Knowledge Base"
      current={current}
      limit={limit}
      unit=" GB"
      className={className}
    />
  );
}

export function WebAgentUsageBar({ current, limit, className }: { current: number; limit: number; className?: string }) {
  return (
    <UsageBar
      label="Web-Agent questo mese"
      current={current}
      limit={limit}
      unit=" run"
      className={className}
    />
  );
}

