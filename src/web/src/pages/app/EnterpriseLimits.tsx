import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import CostCalculator from '../../components/CostCalculator';
import { useAuth } from '../../contexts/auth';
import type { PlanLimits } from '@kyroo/shared/plans';

interface UserProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  custom_limits: Partial<PlanLimits> | null;
}

export default function EnterpriseLimits() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customLimits, setCustomLimits] = useState<Partial<PlanLimits>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userId || !session?.access_token) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`/.netlify/functions/admin?action=get_user_profile&userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
        setCustomLimits(data.custom_limits || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, session?.access_token]);

  const handleLimitChange = (key: keyof PlanLimits, value: string) => {
    setCustomLimits((prev) => ({
      ...prev,
      [key]: value === '' ? null : Number(value),
    }));
  };

  const handleSaveLimits = async () => {
    if (!userId || !session?.access_token) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/.netlify/functions/admin`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_custom_limits',
          userId,
          customLimits,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update custom limits');
      }

      setSuccess('Limiti personalizzati aggiornati con successo!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving custom limits');
      console.error('Error saving custom limits:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent-violet border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!userProfile) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Utente non trovato o non Enterprise</h2>
          <p className="text-foreground-secondary">Assicurati che l'ID utente sia corretto e che l'utente sia di tipo Enterprise.</p>
          <button
            onClick={() => navigate('/app/admin')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-violet hover:bg-accent-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-violet"
          >
            <ArrowLeft size={16} className="mr-2" /> Torna alla Dashboard Admin
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/app/admin')}
                className="text-foreground-secondary hover:text-foreground flex items-center mb-2"
              >
                <ArrowLeft size={18} className="mr-2" /> Torna alla Dashboard Admin
              </button>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Limiti Personalizzati per {userProfile.display_name || 'Utente Enterprise'}
              </h1>
              <p className="text-foreground-secondary">
                Configura i limiti specifici per questo utente Enterprise.
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
              <Check size={20} />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Limits Configuration */}
            <div className="xl:col-span-2">
              <div className="card-elevated p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Configurazione Limiti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Example Limit Input */}
              <div>
                <label htmlFor="maxWorkspaces" className="block text-sm font-medium text-foreground mb-1">
                  Max Workspaces
                </label>
                <input
                  type="number"
                  id="maxWorkspaces"
                  value={customLimits.maxWorkspaces ?? ''}
                  onChange={(e) => handleLimitChange('maxWorkspaces', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di workspace per l'utente. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxUsersPerWorkspace" className="block text-sm font-medium text-foreground mb-1">
                  Max Utenti per Workspace
                </label>
                <input
                  type="number"
                  id="maxUsersPerWorkspace"
                  value={customLimits.maxUsersPerWorkspace ?? ''}
                  onChange={(e) => handleLimitChange('maxUsersPerWorkspace', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di utenti (incluso proprietario) per workspace. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxUserCollaboratorsPerWorkspace" className="block text-sm font-medium text-foreground mb-1">
                  Collaboratori per workspace
                </label>
                <input
                  type="number"
                  id="maxUserCollaboratorsPerWorkspace"
                  value={customLimits.maxUserCollaboratorsPerWorkspace ?? ''}
                  onChange={(e) => handleLimitChange('maxUserCollaboratorsPerWorkspace', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di collaboratori per workspace. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxChatInputTokens" className="block text-sm font-medium text-foreground mb-1">
                  Max Token Input Chat
                </label>
                <input
                  type="number"
                  id="maxChatInputTokens"
                  value={customLimits.maxChatInputTokens ?? ''}
                  onChange={(e) => handleLimitChange('maxChatInputTokens', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di token per input chat. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWebSearchesPerDay" className="block text-sm font-medium text-foreground mb-1">
                  Max Ricerche Web al Giorno
                </label>
                <input
                  type="number"
                  id="maxWebSearchesPerDay"
                  value={customLimits.maxWebSearchesPerDay ?? ''}
                  onChange={(e) => handleLimitChange('maxWebSearchesPerDay', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di ricerche web al giorno per utente. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxFilesPerMonth" className="block text-sm font-medium text-foreground mb-1">
                  Max File al Mese
                </label>
                <input
                  type="number"
                  id="maxFilesPerMonth"
                  value={customLimits.maxFilesPerMonth ?? ''}
                  onChange={(e) => handleLimitChange('maxFilesPerMonth', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di file caricabili al mese. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxFileSizeMB" className="block text-sm font-medium text-foreground mb-1">
                  Max Dimensione File (MB)
                </label>
                <input
                  type="number"
                  id="maxFileSizeMB"
                  value={customLimits.maxFileSizeMB ?? ''}
                  onChange={(e) => handleLimitChange('maxFileSizeMB', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Dimensione massima per singolo file in MB. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxFilePagesPerFile" className="block text-sm font-medium text-foreground mb-1">
                  Max Pagine per File
                </label>
                <input
                  type="number"
                  id="maxFilePagesPerFile"
                  value={customLimits.maxFilePagesPerFile ?? ''}
                  onChange={(e) => handleLimitChange('maxFilePagesPerFile', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di pagine per singolo file. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWebAgentRunsPerMonth" className="block text-sm font-medium text-foreground mb-1">
                  Max Web-Agent Run al Mese
                </label>
                <input
                  type="number"
                  id="maxWebAgentRunsPerMonth"
                  value={customLimits.maxWebAgentRunsPerMonth ?? ''}
                  onChange={(e) => handleLimitChange('maxWebAgentRunsPerMonth', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di esecuzioni Web-Agent al mese. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWebAgentPagesPerRun" className="block text-sm font-medium text-foreground mb-1">
                  Max Pagine Web-Agent per Run
                </label>
                <input
                  type="number"
                  id="maxWebAgentPagesPerRun"
                  value={customLimits.maxWebAgentPagesPerRun ?? ''}
                  onChange={(e) => handleLimitChange('maxWebAgentPagesPerRun', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di pagine che il Web-Agent può visitare per singola esecuzione. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWebAgentRunDurationMinutes" className="block text-sm font-medium text-foreground mb-1">
                  Max Durata Web-Agent (minuti)
                </label>
                <input
                  type="number"
                  id="maxWebAgentRunDurationMinutes"
                  value={customLimits.maxWebAgentRunDurationMinutes ?? ''}
                  onChange={(e) => handleLimitChange('maxWebAgentRunDurationMinutes', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Durata massima di una singola esecuzione Web-Agent in minuti. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxActiveWorkflowsPerWorkspace" className="block text-sm font-medium text-foreground mb-1">
                  Max Workflow Attivi per Workspace
                </label>
                <input
                  type="number"
                  id="maxActiveWorkflowsPerWorkspace"
                  value={customLimits.maxActiveWorkflowsPerWorkspace ?? ''}
                  onChange={(e) => handleLimitChange('maxActiveWorkflowsPerWorkspace', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di workflow attivi per workspace. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWorkflowExecutionsPerDayPerWorkflow" className="block text-sm font-medium text-foreground mb-1">
                  Esecuzioni workflow/giorno per workflow
                </label>
                <input
                  type="number"
                  id="maxWorkflowExecutionsPerDayPerWorkflow"
                  value={customLimits.maxWorkflowExecutionsPerDayPerWorkflow ?? ''}
                  onChange={(e) => handleLimitChange('maxWorkflowExecutionsPerDayPerWorkflow', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di esecuzioni workflow al giorno. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWorkflowConcurrency" className="block text-sm font-medium text-foreground mb-1">
                  Max Concorrenza Workflow
                </label>
                <input
                  type="number"
                  id="maxWorkflowConcurrency"
                  value={customLimits.maxWorkflowConcurrency ?? ''}
                  onChange={(e) => handleLimitChange('maxWorkflowConcurrency', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Numero massimo di workflow che possono essere eseguiti contemporaneamente. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxWorkflowRunDurationMinutes" className="block text-sm font-medium text-foreground mb-1">
                  Max Durata Workflow (minuti)
                </label>
                <input
                  type="number"
                  id="maxWorkflowRunDurationMinutes"
                  value={customLimits.maxWorkflowRunDurationMinutes ?? ''}
                  onChange={(e) => handleLimitChange('maxWorkflowRunDurationMinutes', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Durata massima di una singola esecuzione workflow in minuti. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="maxKnowledgeBaseSizeGB" className="block text-sm font-medium text-foreground mb-1">
                  Max Knowledge Base (GB)
                </label>
                <input
                  type="number"
                  id="maxKnowledgeBaseSizeGB"
                  value={customLimits.maxKnowledgeBaseSizeGB ?? ''}
                  onChange={(e) => handleLimitChange('maxKnowledgeBaseSizeGB', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Dimensione massima della Knowledge Base in GB. (-1 per illimitato)</p>
              </div>

              <div>
                <label htmlFor="dataRetentionDays" className="block text-sm font-medium text-foreground mb-1">
                  Retention Dati (giorni)
                </label>
                <input
                  type="number"
                  id="dataRetentionDays"
                  value={customLimits.dataRetentionDays ?? ''}
                  onChange={(e) => handleLimitChange('dataRetentionDays', e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent"
                  placeholder="-1 per illimitato"
                />
                <p className="text-xs text-foreground-secondary mt-1">Giorni di retention per dati e log. (-1 per illimitato)</p>
              </div>

              {/* Add more fields for other limits as needed */}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveLimits}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-accent-violet hover:bg-accent-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-violet disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save size={20} className="mr-2" />
                )}
                Salva Limiti
              </button>
            </div>
          </div>
        </div>

        {/* Cost Calculator */}
        <div className="xl:col-span-1">
          <CostCalculator limits={customLimits} />
        </div>
      </div>
        </motion.div>
      </div>
    </AppShell>
  );
}


