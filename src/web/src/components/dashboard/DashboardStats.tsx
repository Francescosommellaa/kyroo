import { motion } from 'framer-motion';
import { Users, Shield, UserCheck } from 'lucide-react';
import type { DashboardStatsProps } from './dashboard-types';
import { calculateDashboardStats } from './dashboard-utils';

export default function DashboardStats({ users, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card-elevated animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-surface rounded w-20 mb-2" />
                <div className="h-8 bg-surface rounded w-12" />
              </div>
              <div className="w-12 h-12 bg-surface rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = calculateDashboardStats(users);

  const statsCards = [
    {
      title: 'Totale Utenti',
      value: stats.totalUsers,
      icon: Users,
      color: 'accent-violet',
      delay: 0.1
    },
    {
      title: 'Amministratori',
      value: stats.adminUsers,
      icon: Shield,
      color: 'accent-cyan',
      delay: 0.2
    },
    {
      title: 'Utenti Standard',
      value: stats.standardUsers,
      icon: UserCheck,
      color: 'green-500',
      delay: 0.3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsCards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <motion.div
            key={card.title}
            className="card-elevated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: card.delay }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground-secondary text-sm">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${card.color}/10 rounded-xl flex items-center justify-center`}>
                <IconComponent className={`text-${card.color}`} size={24} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}