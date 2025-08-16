import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import type { DashboardFiltersProps } from './dashboard-types';
import { getPlanFilterOptions, getRoleFilterOptions } from './dashboard-utils';

export default function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const planOptions = getPlanFilterOptions();
  const roleOptions = getRoleFilterOptions();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ searchTerm: value });
  };

  const handleRoleFilterChange = (value: string) => {
    onFiltersChange({ roleFilter: value as 'all' | 'user' | 'admin' });
  };

  const handlePlanFilterChange = (value: string) => {
    onFiltersChange({ planFilter: value as any });
  };

  return (
    <motion.div
      className="card-elevated mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Cerca per nome o ID..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary pointer-events-none"
            size={18}
          />
          <select
            value={filters.roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="pl-10 pr-8 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent appearance-none cursor-pointer transition-all duration-200 min-w-[140px]"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Plan Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary pointer-events-none"
            size={18}
          />
          <select
            value={filters.planFilter}
            onChange={(e) => handlePlanFilterChange(e.target.value)}
            className="pl-10 pr-8 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent appearance-none cursor-pointer transition-all duration-200 min-w-[140px]"
          >
            {planOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.searchTerm || filters.roleFilter !== 'all' || filters.planFilter !== 'all') && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-foreground-secondary">Filtri attivi:</span>
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent-violet/10 text-accent-violet text-xs">
                Ricerca: "{filters.searchTerm}"
              </span>
            )}
            {filters.roleFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-accent-cyan/10 text-accent-cyan text-xs">
                Ruolo: {roleOptions.find(opt => opt.value === filters.roleFilter)?.label}
              </span>
            )}
            {filters.planFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs">
                Piano: {planOptions.find(opt => opt.value === filters.planFilter)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}