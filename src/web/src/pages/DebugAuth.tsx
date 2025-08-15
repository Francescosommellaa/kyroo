import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Mail, Database, User, Bug, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { EmailConfigFallback, useEmailFallback, EmailConfigTips } from '../components/EmailConfigFallback';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function DebugAuth() {
  const { signUp, resendVerificationEmail } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const { fallbackState, showFallback, hideFallback } = useEmailFallback();

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Connessione Supabase
    updateTestResult('Connessione Supabase', 'running', 'Verificando connessione...');
    try {
      const { error } = await supabase.from('user').select('count').limit(1);
      if (error) {
        updateTestResult('Connessione Supabase', 'error', `Errore: ${error.message}`, error);
      } else {
        updateTestResult('Connessione Supabase', 'success', 'Connessione stabilita con successo');
      }
    } catch (err: any) {
      updateTestResult('Connessione Supabase', 'error', `Errore di connessione: ${err.message}`, err);
    }

    // Test 2: Struttura tabella user
    updateTestResult('Struttura tabella user', 'running', 'Verificando struttura tabella...');
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .limit(1);
      
      if (error) {
        updateTestResult('Struttura tabella user', 'error', `Errore: ${error.message}`, error);
      } else {
        updateTestResult('Struttura tabella user', 'success', 'Tabella user accessibile', data);
      }
    } catch (err: any) {
      updateTestResult('Struttura tabella user', 'error', `Errore: ${err.message}`, err);
    }

    // Test 3: Trigger handle_new_user
    updateTestResult('Trigger handle_new_user', 'running', 'Verificando esistenza trigger...');
    try {
      const { error } = await supabase.rpc('check_trigger_exists', {
        trigger_name: 'handle_new_user'
      });
      
      if (error) {
        updateTestResult('Trigger handle_new_user', 'error', `Impossibile verificare: ${error.message}`, error);
      } else {
        updateTestResult('Trigger handle_new_user', 'success', 'Verifica completata (controllare manualmente)');
      }
    } catch (err: any) {
      updateTestResult('Trigger handle_new_user', 'error', `Errore: ${err.message}`, err);
    }

    // Test 4: Configurazione Auth
    updateTestResult('Configurazione Auth', 'running', 'Verificando configurazione autenticazione...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        updateTestResult('Configurazione Auth', 'error', `Errore sessione: ${error.message}`, error);
      } else {
        updateTestResult('Configurazione Auth', 'success', 'Configurazione auth funzionante', { hasSession: !!session });
      }
    } catch (err: any) {
      updateTestResult('Configurazione Auth', 'error', `Errore: ${err.message}`, err);
    }

    setIsRunning(false);
  };

  const testRegistration = async () => {
    updateTestResult('Test Registrazione', 'running', 'Tentativo di registrazione...');
    
    try {
      const result = await signUp(testEmail, testPassword, 'Test User');
      
      if (result.success) {
        updateTestResult('Test Registrazione', 'success', 'Registrazione completata con successo', result);
      } else {
        updateTestResult('Test Registrazione', 'error', result.error || 'Errore sconosciuto', result);
      }
    } catch (err: any) {
      updateTestResult('Test Registrazione', 'error', `Errore imprevisto: ${err.message}`, err);
    }
  };

  const testEmailResend = async () => {
    updateTestResult('Test Reinvio Email', 'running', 'Tentativo di reinvio email...');
    
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        updateTestResult('Test Reinvio Email', 'success', 'Email reinviata con successo', result);
      } else {
        updateTestResult('Test Reinvio Email', 'error', result.error || 'Errore sconosciuto', result);
      }
    } catch (err: any) {
      updateTestResult('Test Reinvio Email', 'error', `Errore imprevisto: ${err.message}`, err);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="animate-spin text-blue-500" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Bug className="text-accent-violet" />
            Debug Autenticazione & Email
          </h1>
          <p className="text-foreground-secondary">
            Strumento di debug per testare la registrazione utenti e l'invio delle email di verifica.
          </p>
        </motion.div>

        {/* Mostra il fallback email se attivo */}
        {fallbackState.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <EmailConfigFallback
              error={fallbackState.error}
              errorCode={fallbackState.errorCode}
              email={fallbackState.email}
              onRetry={() => {
                // Riprova l'ultima azione
                console.log('Retry richiesto dal fallback');
              }}
              onDismiss={hideFallback}
            />
          </motion.div>
        )}

        {/* Suggerimenti per la configurazione email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <EmailConfigTips />
        </motion.div>

        {/* Controlli di test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="text-accent-violet" />
            Test di Sistema
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email di test
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password di test
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="password123"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
              Test Sistema
            </button>
            
            <button
              onClick={testRegistration}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <User size={16} />
              Test Registrazione
            </button>
            
            <button
              onClick={testEmailResend}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Mail size={16} />
              Test Reinvio Email
            </button>
            
            <button
              onClick={() => showFallback('Test fallback email', 'EMAIL_RATE_LIMIT', testEmail)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <AlertTriangle size={16} />
              Testa Fallback Email
            </button>
            
            <button
              onClick={() => showFallback('Test errore database', 'DATABASE_SAVE_ERROR', testEmail)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Database size={16} />
              Testa Errore Database
            </button>
          </div>
        </motion.div>

        {/* Risultati dei test */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Risultati Test
            </h2>
            
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <motion.div
                  key={result.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(result.status)}
                    <h3 className="font-medium text-foreground">{result.name}</h3>
                  </div>
                  
                  <p className="text-foreground-secondary text-sm mb-2">
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-foreground-secondary hover:text-foreground">
                        Dettagli tecnici
                      </summary>
                      <pre className="mt-2 p-2 bg-background rounded border text-foreground-secondary overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}