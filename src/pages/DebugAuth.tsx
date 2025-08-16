import { useState } from 'react';
import { useAuth } from '../web/src/contexts/AuthContext';
import { supabase } from '../web/src/lib/supabase';
import { AlertCircle, CheckCircle, Loader2, Mail, Database, User } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function DebugAuth() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) =>
      i === index ? { ...result, ...updates } : result
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Connessione Supabase
    addTestResult({
      test: 'Connessione Supabase',
      status: 'pending',
      message: 'Verificando connessione...'
    });

    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      updateTestResult(0, {
        status: 'success',
        message: 'Connessione al database riuscita',
        details: data
      });
    } catch (error: any) {
      updateTestResult(0, {
        status: 'error',
        message: `Errore connessione: ${error.message}`,
        details: error
      });
    }

    // Test 2: Verifica tabella user
    addTestResult({
      test: 'Struttura tabella user',
      status: 'pending',
      message: 'Verificando struttura tabella...'
    });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (error) throw error;
      updateTestResult(1, {
        status: 'success',
        message: 'Tabella user accessibile',
        details: { columns: data ? Object.keys(data[0] || {}) : [] }
      });
    } catch (error: any) {
      updateTestResult(1, {
        status: 'error',
        message: `Errore accesso tabella: ${error.message}`,
        details: error
      });
    }

    // Test 3: Verifica trigger
    addTestResult({
      test: 'Trigger handle_new_user',
      status: 'pending',
      message: 'Verificando esistenza trigger...'
    });

    try {
      const { data, error } = await supabase.rpc('pg_get_functiondef', {
        funcid: 'handle_new_user'
      });

      if (error) throw error;
      updateTestResult(2, {
        status: 'success',
        message: 'Trigger handle_new_user trovato',
        details: data
      });
    } catch (error: any) {
      updateTestResult(2, {
        status: 'error',
        message: `Trigger non trovato o errore: ${error.message}`,
        details: error
      });
    }

    // Test 4: Configurazione Auth
    addTestResult({
      test: 'Configurazione Auth',
      status: 'pending',
      message: 'Verificando impostazioni auth...'
    });

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      updateTestResult(3, {
        status: 'success',
        message: 'Configurazione auth valida',
        details: { hasSession: !!session, user: session?.user?.email }
      });
    } catch (error: any) {
      updateTestResult(3, {
        status: 'error',
        message: `Errore configurazione auth: ${error.message}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  const testRegistration = async () => {
    if (!email || !password || !displayName) {
      alert('Compila tutti i campi per il test di registrazione');
      return;
    }

    setIsRunning(true);
    addTestResult({
      test: 'Test Registrazione',
      status: 'pending',
      message: 'Tentativo di registrazione...'
    });

    try {
      const result = await signUp(email, password, displayName);
      const lastIndex = testResults.length;

      if (result.success) {
        updateTestResult(lastIndex, {
          status: 'success',
          message: 'Registrazione completata con successo',
          details: result
        });
      } else {
        updateTestResult(lastIndex, {
          status: 'error',
          message: `Errore registrazione: ${result.error}`,
          details: result
        });
      }
    } catch (error: any) {
      const lastIndex = testResults.length;
      updateTestResult(lastIndex, {
        status: 'error',
        message: `Errore imprevisto: ${error.message}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  const testEmailResend = async () => {
    if (!email) {
      alert('Inserisci un email per testare il reinvio');
      return;
    }

    setIsRunning(true);
    addTestResult({
      test: 'Test Reinvio Email',
      status: 'pending',
      message: 'Tentativo di reinvio email...'
    });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      const lastIndex = testResults.length;

      if (error) {
        updateTestResult(lastIndex, {
          status: 'error',
          message: `Errore reinvio: ${error.message}`,
          details: error
        });
      } else {
        updateTestResult(lastIndex, {
          status: 'success',
          message: 'Email di verifica inviata',
          details: { email, redirectTo: `${window.location.origin}/auth/callback` }
        });
      }
    } catch (error: any) {
      const lastIndex = testResults.length;
      updateTestResult(lastIndex, {
        status: 'error',
        message: `Errore imprevisto: ${error.message}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6" />
            Debug Autenticazione
          </h1>

          {/* Diagnostica Sistema */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Diagnostica Sistema</h2>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Esegui Diagnostica
            </button>
          </div>

          {/* Test Registrazione */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Registrazione</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Nome Visualizzato"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={testRegistration}
                disabled={isRunning}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                Test Registrazione
              </button>
              <button
                onClick={testEmailResend}
                disabled={isRunning}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Test Reinvio Email
              </button>
            </div>
          </div>

          {/* Risultati Test */}
          {testResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Risultati Test</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium text-gray-900">{result.test}</h3>
                    </div>
                    <p className={`text-sm ${
                      result.status === 'error' ? 'text-red-600' :
                      result.status === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Dettagli</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
