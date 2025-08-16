import { AuthError } from "@supabase/supabase-js";
import { AuthErrorCode, AuthEvent, ValidationRule, FormValidationRules } from "./auth-types";
// import { debug } from "../../lib/debug";

// Validation utilities
export const createValidationRule = (validate: (value: string) => boolean, message: string): ValidationRule => ({
  validate,
  message
});

export const emailValidationRules: ValidationRule[] = [
  createValidationRule(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    "Inserisci un indirizzo email valido"
  )
];

export const passwordValidationRules: ValidationRule[] = [
  createValidationRule(
    (password) => password.length >= 8,
    "La password deve contenere almeno 8 caratteri"
  ),
  createValidationRule(
    (password) => /[A-Z]/.test(password),
    "La password deve contenere almeno una lettera maiuscola"
  ),
  createValidationRule(
    (password) => /[a-z]/.test(password),
    "La password deve contenere almeno una lettera minuscola"
  ),
  createValidationRule(
    (password) => /\d/.test(password),
    "La password deve contenere almeno un numero"
  )
];

export const fullNameValidationRules: ValidationRule[] = [
  createValidationRule(
    (name) => name.trim().length >= 2,
    "Il nome completo deve contenere almeno 2 caratteri"
  ),
  createValidationRule(
    (name) => /^[a-zA-Z\s'-]+$/.test(name.trim()),
    "Il nome può contenere solo lettere, spazi, trattini e apostrofi"
  )
];

export const displayNameValidationRules: ValidationRule[] = [
  createValidationRule(
    (name) => name.trim().length >= 2,
    "Il nome visualizzato deve contenere almeno 2 caratteri"
  ),
  createValidationRule(
    (name) => name.trim().length <= 50,
    "Il nome visualizzato deve essere inferiore a 50 caratteri"
  )
];

export const authValidationRules: FormValidationRules = {
  email: emailValidationRules,
  password: passwordValidationRules,
  fullName: fullNameValidationRules,
  displayName: displayNameValidationRules
};

// Validation functions
export const validateField = (value: string, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  return validateField(email, emailValidationRules);
};

export const validatePassword = (password: string): string | null => {
  return validateField(password, passwordValidationRules);
};

export const validateFullName = (fullName: string): string | null => {
  return validateField(fullName, fullNameValidationRules);
};

export const validateDisplayName = (displayName: string): string | null => {
  return validateField(displayName, displayNameValidationRules);
};

// File validation utilities
export const validateAvatarFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '🖼️ Seleziona un file immagine valido (JPEG, PNG, GIF o WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '📏 Il file deve essere inferiore a 5MB'
    };
  }

  return { isValid: true };
};

// Error mapping utilities
export const mapSupabaseError = (error: AuthError): { code: AuthErrorCode; message: string } => {
  const errorMessage = error.message.toLowerCase();

  // Map common Supabase errors to our error codes with Italian messages
  if (errorMessage.includes('user already registered')) {
    return { 
      code: AuthErrorCode.USER_ALREADY_EXISTS, 
      message: '🔒 Esiste già un account con questa email. Prova ad accedere o usa un\'altra email.' 
    };
  }
  
  if (errorMessage.includes('invalid email')) {
    return { 
      code: AuthErrorCode.INVALID_EMAIL, 
      message: '📧 L\'indirizzo email non è valido. Controlla e riprova.' 
    };
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('short')) {
    return { 
      code: AuthErrorCode.PASSWORD_TOO_SHORT, 
      message: '🔐 La password è troppo corta. Deve contenere almeno 8 caratteri.' 
    };
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return { 
      code: AuthErrorCode.EMAIL_NOT_CONFIRMED, 
      message: '✉️ Controlla la tua email e clicca sul link di conferma per attivare l\'account.' 
    };
  }
  
  if (errorMessage.includes('invalid login credentials')) {
    return { 
      code: AuthErrorCode.INVALID_CREDENTIALS, 
      message: '❌ Email o password non corretti. Verifica i tuoi dati e riprova.' 
    };
  }
  
  if (errorMessage.includes('too many requests')) {
    return { 
      code: AuthErrorCode.TOO_MANY_REQUESTS, 
      message: '⏱️ Troppi tentativi. Attendi qualche minuto prima di riprovare.' 
    };
  }
  
  if (errorMessage.includes('rate limit')) {
    return { 
      code: AuthErrorCode.EMAIL_RATE_LIMIT, 
      message: '📨 Attendi prima di richiedere un\'altra email di verifica.' 
    };
  }
  
  if (errorMessage.includes('permission denied') || errorMessage.includes('access denied')) {
    return { 
      code: AuthErrorCode.PERMISSION_DENIED, 
      message: '🚫 Accesso negato. Verifica le tue credenziali e riprova.' 
    };
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return { 
      code: AuthErrorCode.CONNECTION_ERROR, 
      message: '🌐 Problema di connessione. Controlla la tua connessione internet e riprova.' 
    };
  }

  if (errorMessage.includes('weak password')) {
    return { 
      code: AuthErrorCode.PASSWORD_TOO_SHORT, 
      message: '🔒 Password troppo debole. Usa almeno 8 caratteri con lettere maiuscole, minuscole e numeri.' 
    };
  }

  if (errorMessage.includes('signup disabled')) {
    return { 
      code: AuthErrorCode.UNKNOWN_SIGNIN_ERROR, 
      message: '🚫 Le registrazioni sono temporaneamente disabilitate. Riprova più tardi.' 
    };
  }

  if (errorMessage.includes('timeout')) {
    return { 
      code: AuthErrorCode.CONNECTION_ERROR, 
      message: '⏰ Richiesta scaduta. Controlla la connessione e riprova.' 
    };
  }

  // Default fallback with Italian message
  return { 
    code: AuthErrorCode.UNKNOWN_SIGNIN_ERROR, 
    message: '⚠️ Si è verificato un errore imprevisto. Riprova tra qualche istante.' 
  };
};

// Logging utilities
export const logAuthEvent = (event: AuthEvent, details?: any): void => {
  console.log(`Auth Event: ${event}`);
};

export const logAuthError = (event: AuthEvent, error: any, context?: any): void => {
  console.error(`Auth Error: ${event}`);
};

// Avatar utilities
export const generateAvatarPath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `avatars/${userId}/${timestamp}.${extension}`;
};

export const getAvatarUrl = (path: string, supabaseUrl: string): string => {
  return `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
};

// Session utilities
export const isSessionValid = (session: any): boolean => {
  if (!session || !session.access_token) {
    return false;
  }
  
  const expiresAt = session.expires_at;
  if (!expiresAt) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return expiresAt > now;
};

// Retry utilities
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};