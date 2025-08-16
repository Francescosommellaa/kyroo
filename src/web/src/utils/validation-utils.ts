// Utilità per validazioni con messaggi specifici in italiano

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

// Validazione email con messaggi specifici
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      message: 'L\'indirizzo email è obbligatorio',
      suggestions: ['Inserisci un indirizzo email valido']
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Formato email non valido',
      suggestions: [
        'Assicurati che contenga @ e un dominio valido',
        'Esempio: nome@esempio.com'
      ]
    };
  }

  // Controlli aggiuntivi per email comuni
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'libero.it', 'alice.it'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && !commonDomains.includes(domain) && !domain.includes('.')) {
    return {
      isValid: false,
      message: 'Il dominio email sembra incompleto',
      suggestions: [
        'Verifica che il dominio sia corretto',
        'Esempi: gmail.com, yahoo.it, outlook.com'
      ]
    };
  }

  return { isValid: true };
};

// Validazione password con criteri specifici
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      message: 'La password è obbligatoria',
      suggestions: ['Crea una password sicura di almeno 8 caratteri']
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password troppo corta',
      suggestions: [
        'Usa almeno 8 caratteri',
        'Combina lettere, numeri e simboli per maggiore sicurezza'
      ]
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password troppo lunga',
      suggestions: ['Usa massimo 128 caratteri']
    };
  }

  // Controllo caratteri comuni
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const missingCriteria = [];
  if (!hasLowerCase) missingCriteria.push('lettere minuscole');
  if (!hasUpperCase) missingCriteria.push('lettere maiuscole');
  if (!hasNumbers) missingCriteria.push('numeri');
  if (!hasSpecialChar) missingCriteria.push('caratteri speciali (!@#$%^&*)');

  // Password debole se mancano troppi criteri
  if (missingCriteria.length >= 3) {
    return {
      isValid: false,
      message: 'Password troppo debole',
      suggestions: [
        `Aggiungi: ${missingCriteria.join(', ')}`,
        'Una password forte protegge meglio il tuo account'
      ]
    };
  }

  // Password comuni da evitare
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Password troppo comune',
      suggestions: [
        'Evita password facilmente indovinabili',
        'Crea una combinazione unica di caratteri'
      ]
    };
  }

  return { isValid: true };
};

// Validazione conferma password
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Conferma la tua password',
      suggestions: ['Ripeti la password per verificarla']
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Le password non corrispondono',
      suggestions: [
        'Assicurati di aver digitato la stessa password',
        'Controlla eventuali errori di battitura'
      ]
    };
  }

  return { isValid: true };
};

// Validazione nome completo
export const validateFullName = (fullName: string): ValidationResult => {
  if (!fullName || !fullName.trim()) {
    return {
      isValid: false,
      message: 'Il nome completo è obbligatorio',
      suggestions: ['Inserisci il tuo nome e cognome']
    };
  }

  const trimmedName = fullName.trim();
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Nome troppo corto',
      suggestions: ['Inserisci almeno 2 caratteri']
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      message: 'Nome troppo lungo',
      suggestions: ['Usa massimo 100 caratteri']
    };
  }

  // Controllo caratteri validi
  const validNameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!validNameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Il nome contiene caratteri non validi',
      suggestions: [
        'Usa solo lettere, spazi, apostrofi e trattini',
        'Evita numeri e simboli speciali'
      ]
    };
  }

  // Controllo che contenga almeno due parole (nome e cognome)
  const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2) {
    return {
      isValid: false,
      message: 'Inserisci nome e cognome',
      suggestions: ['Esempio: Mario Rossi']
    };
  }

  return { isValid: true };
};

// Validazione nome visualizzato
export const validateDisplayName = (displayName: string): ValidationResult => {
  if (!displayName || !displayName.trim()) {
    return {
      isValid: false,
      message: 'Il nome visualizzato è obbligatorio',
      suggestions: ['Scegli come vuoi essere chiamato']
    };
  }

  const trimmedName = displayName.trim();
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Nome visualizzato troppo corto',
      suggestions: ['Usa almeno 2 caratteri']
    };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      message: 'Nome visualizzato troppo lungo',
      suggestions: ['Usa massimo 50 caratteri']
    };
  }

  // Controllo caratteri validi (più permissivo del nome completo)
  const validDisplayNameRegex = /^[a-zA-ZÀ-ÿ0-9\s._-]+$/;
  if (!validDisplayNameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Il nome visualizzato contiene caratteri non validi',
      suggestions: [
        'Usa lettere, numeri, spazi, punti, underscore e trattini',
        'Evita caratteri speciali come @#$%'
      ]
    };
  }

  return { isValid: true };
};

// Funzione helper per validare tutti i campi del form di registrazione
export const validateSignupForm = (formData: {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  displayName?: string;
}) => {
  const errors: Record<string, ValidationResult> = {};

  // Validazione email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation;
  }

  // Validazione password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation;
  }

  // Validazione conferma password
  if (formData.confirmPassword !== undefined) {
    const confirmPasswordValidation = validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation;
    }
  }

  // Validazione nome completo
  if (formData.fullName !== undefined) {
    const fullNameValidation = validateFullName(formData.fullName);
    if (!fullNameValidation.isValid) {
      errors.fullName = fullNameValidation;
    }
  }

  // Validazione nome visualizzato
  if (formData.displayName !== undefined) {
    const displayNameValidation = validateDisplayName(formData.displayName);
    if (!displayNameValidation.isValid) {
      errors.displayName = displayNameValidation;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Funzione helper per validare il form di login
export const validateLoginForm = (formData: {
  email: string;
  password: string;
}) => {
  const errors: Record<string, ValidationResult> = {};

  // Validazione email (più semplice per il login)
  if (!formData.email || !formData.email.trim()) {
    errors.email = {
      isValid: false,
      message: 'Inserisci la tua email',
      suggestions: ['L\'email è necessaria per accedere']
    };
  }

  // Validazione password (più semplice per il login)
  if (!formData.password) {
    errors.password = {
      isValid: false,
      message: 'Inserisci la tua password',
      suggestions: ['La password è necessaria per accedere']
    };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};