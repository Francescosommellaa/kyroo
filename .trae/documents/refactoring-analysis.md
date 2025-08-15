# Analisi e Piano di Refactoring - Progetto Kyroo

## 1. Analisi delle Violazioni Attuali

### 1.1 File che Superano i 250 Righe

| File | Righe Attuali | Violazione | Priorità |
|------|---------------|------------|----------|
| `AuthContext.tsx` | 740 | **CRITICA** - 296% oltre il limite | Alta |
| `AuthModal.tsx` | 590 | **CRITICA** - 236% oltre il limite | Alta |
| `TermsOfService.tsx` | 347 | **ALTA** - 139% oltre il limite | Media |
| `CostCalculator.tsx` | 309 | **ALTA** - 124% oltre il limite | Media |

### 1.2 Pattern di Logica Duplicata Identificati

#### Form Handling e Validazioni
- **AuthModal.tsx** e **SignupForm.tsx**: validazione password, email, gestione errori
- **ResetPasswordPage.tsx** e **AuthModal.tsx**: validazione password, conferma password
- **AuthModal.tsx** e **AuthContext.tsx**: logica di autenticazione duplicata

#### State Management Patterns
- Loading states ripetuti in: `AuthModal`, `AuthContext`, `CostCalculator`, `usePlan`
- Error handling simile in: `AuthModal`, `ResetPasswordPage`, `AuthContext`
- Form state management duplicato in componenti di autenticazione

#### UI Patterns
- Password visibility toggle ripetuto in `AuthModal` e `ResetPasswordPage`
- Loading spinners con stili simili in più componenti
- Error/success message display patterns duplicati

### 1.3 Componenti che Superano i 150 Righe

- `AuthModal.tsx`: ~590 righe (componente monolitico)
- `CostCalculator.tsx`: ~309 righe (logica di calcolo e UI mescolate)
- Molti componenti in `pages/app/` probabilmente superano il limite

### 1.4 Mancanza di Centralizzazione

#### Hook Mancanti
- `useForm` - per gestione form generica
- `useAsync` - per operazioni asincrone con loading/error
- `useDebounce` - per input con debounce
- `useLocalStorage` - per persistenza locale
- `usePasswordValidation` - per validazione password
- `useEmailValidation` - per validazione email

#### Utility Mancanti
- Validatori di input centralizzati
- Formatter per errori
- Helper per gestione form
- Constants per messaggi di errore

## 2. Piano di Refactoring Step-by-Step

### Phase 1: Estrazione Hook e Utility (Priorità Alta)

#### Step 1.1: Creare Hook di Base
```typescript
// hooks/useAsync.ts - Gestione operazioni asincrone
// hooks/useForm.ts - Gestione form generica
// hooks/usePasswordToggle.ts - Toggle visibilità password
// hooks/useValidation.ts - Validazioni centralizzate
```

#### Step 1.2: Creare Utility di Validazione
```typescript
// lib/validators.ts - Validatori puri
// lib/form-utils.ts - Helper per form
// lib/error-utils.ts - Gestione errori
// lib/constants.ts - Messaggi e costanti
```

### Phase 2: Refactoring AuthContext (Priorità Critica)

#### Step 2.1: Spezzare AuthContext
```typescript
// contexts/AuthContext.tsx (max 150 righe)
// hooks/useAuthOperations.ts - Operazioni auth
// hooks/useProfileManagement.ts - Gestione profilo
// lib/auth-utils.ts - Utility auth
```

#### Step 2.2: Estrarre Logica Business
- Spostare validazioni in `lib/validators.ts`
- Spostare operazioni Supabase in `lib/supabase-auth.ts`
- Creare `hooks/useAuthState.ts` per stato auth

### Phase 3: Refactoring AuthModal (Priorità Critica)

#### Step 3.1: Spezzare in Componenti
```typescript
// components/auth/AuthModal.tsx (max 150 righe)
// components/auth/LoginForm.tsx
// components/auth/RegisterForm.tsx
// components/auth/ResetPasswordForm.tsx
// components/auth/VerifyEmailView.tsx
```

#### Step 3.2: Estrarre Hook Specifici
```typescript
// hooks/useAuthModal.ts - Stato e logica modal
// hooks/useAuthForm.ts - Logica form auth
```

### Phase 4: Refactoring Altri Componenti

#### Step 4.1: CostCalculator
```typescript
// components/billing/CostCalculator.tsx (max 150 righe)
// components/billing/CostBreakdown.tsx
// components/billing/UtilizationSlider.tsx
// hooks/useCostCalculation.ts
```

#### Step 4.2: TermsOfService
```typescript
// pages/TermsOfService.tsx (max 150 righe)
// components/legal/LegalSection.tsx
// components/legal/LegalHeader.tsx
// data/terms-content.ts
```

## 3. Nuova Struttura di Cartelle Proposta

```
src/
├── components/
│   ├── ui/                    # Componenti presentazionali riutilizzabili
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── index.ts           # Barrel export
│   ├── auth/                  # Componenti autenticazione
│   │   ├── AuthModal.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── index.ts
│   ├── billing/               # Componenti billing
│   │   ├── CostCalculator.tsx
│   │   ├── CostBreakdown.tsx
│   │   ├── PlanCard.tsx
│   │   └── index.ts
│   ├── legal/                 # Componenti legali
│   │   ├── LegalSection.tsx
│   │   ├── LegalHeader.tsx
│   │   └── index.ts
│   └── common/                # Componenti comuni
│       ├── AppShell.tsx
│       ├── Navbar.tsx
│       └── index.ts
├── hooks/                     # Custom hooks riutilizzabili
│   ├── useAsync.ts
│   ├── useForm.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePasswordToggle.ts
│   ├── useValidation.ts
│   ├── useAuthOperations.ts
│   ├── useAuthModal.ts
│   ├── useCostCalculation.ts
│   └── index.ts
├── lib/                       # Utility e funzioni pure
│   ├── validators.ts
│   ├── form-utils.ts
│   ├── error-utils.ts
│   ├── auth-utils.ts
│   ├── supabase-auth.ts
│   ├── constants.ts
│   └── index.ts
├── types/                     # Type definitions
│   ├── auth.ts
│   ├── forms.ts
│   ├── api.ts
│   └── index.ts
└── data/                      # Dati statici
    ├── terms-content.ts
    ├── privacy-content.ts
    └── index.ts
```

## 4. Hook e Utility da Estrarre

### 4.1 Hook Prioritari

| Hook | Descrizione | Componenti che lo Useranno |
|------|-------------|-----------------------------|
| `useAsync<T>` | Gestione stato async (loading, error, data) | AuthModal, AuthContext, CostCalculator |
| `useForm<T>` | Gestione form generica con validazione | AuthModal, ResetPasswordPage, SignupForm |
| `usePasswordToggle` | Toggle visibilità password | AuthModal, ResetPasswordPage |
| `useValidation` | Validazioni centralizzate | Tutti i form |
| `useAuthOperations` | Operazioni auth (login, register, reset) | AuthModal, AuthContext |
| `useDebounce<T>` | Debounce per input | CostCalculator, Search components |

### 4.2 Utility Prioritarie

| Utility | Descrizione | Uso |
|---------|-------------|-----|
| `validators.ts` | Validatori puri (email, password, etc.) | Form validation |
| `form-utils.ts` | Helper per gestione form | Form handling |
| `error-utils.ts` | Formatter e gestione errori | Error display |
| `auth-utils.ts` | Utility per autenticazione | Auth operations |
| `constants.ts` | Messaggi errore e costanti | Consistency |

## 5. Implementazione Error Boundaries

### 5.1 Error Boundaries da Aggiungere

```typescript
// components/error/AuthErrorBoundary.tsx
// components/error/AppErrorBoundary.tsx
// components/error/PageErrorBoundary.tsx
```

### 5.2 Posizionamento
- `AppErrorBoundary`: Wrapper principale app
- `AuthErrorBoundary`: Wrapper componenti auth
- `PageErrorBoundary`: Wrapper singole pagine

## 6. Debug e Logging

### 6.1 Sistema di Debug Centralizzato

```typescript
// lib/debug.ts
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const debugLog = {
  auth: (event: string, data?: any) => DEBUG && console.log(`[AUTH] ${event}`, data),
  form: (event: string, data?: any) => DEBUG && console.log(`[FORM] ${event}`, data),
  api: (event: string, data?: any) => DEBUG && console.log(`[API] ${event}`, data),
};
```

### 6.2 Logging Strutturato
- Eventi: login_attempt, form_validation, api_call
- Formato: `[CATEGORY] event_name: {relevant_data}`
- Produzione: solo errori critici

## 7. Checklist di Validazione Finale

### 7.1 Limiti di Dimensione
- [ ] Tutti i file ≤ 250 righe
- [ ] Tutti i componenti ≤ 150 righe
- [ ] Tutte le funzioni ≤ 60 righe

### 7.2 Zero Duplicazioni
- [ ] Nessuna logica di validazione duplicata
- [ ] Nessun pattern di form handling duplicato
- [ ] Nessuna gestione errori duplicata
- [ ] Nessun hook duplicato tra componenti

### 7.3 Architettura
- [ ] Logica business estratta da componenti UI
- [ ] Hook riutilizzabili centralizzati in `hooks/`
- [ ] Utility pure centralizzate in `lib/`
- [ ] Componenti UI in `components/ui/`
- [ ] Barrel exports configurati

### 7.4 Error Handling
- [ ] Error boundaries attivi
- [ ] Messaggi errore user-friendly
- [ ] Logging strutturato implementato
- [ ] Try/catch su operazioni async

### 7.5 TypeScript
- [ ] Tipi espliciti su props
- [ ] Tipi espliciti su return values
- [ ] Tipi espliciti su errori
- [ ] Nessun `any` type

### 7.6 Testing
- [ ] Smoke test per render senza crash
- [ ] Test happy path principale
- [ ] Test edge case critico
- [ ] Test gestione errore

## 8. Stima Effort e Timeline

### Phase 1 (Hook e Utility): 2-3 giorni
- Creazione hook base
- Estrazione utility
- Setup error boundaries

### Phase 2 (AuthContext): 1-2 giorni
- Refactoring AuthContext
- Estrazione logica auth

### Phase 3 (AuthModal): 2-3 giorni
- Spezzare AuthModal
- Creare componenti specifici

### Phase 4 (Altri componenti): 3-4 giorni
- Refactoring CostCalculator
- Refactoring TermsOfService
- Cleanup finale

**Totale stimato: 8-12 giorni**

## 9. Runbook di Debug

### 9.1 Problemi Comuni e Soluzioni

#### Build Errors
- **Problema**: Import circolari
- **Soluzione**: Verificare barrel exports, usare type-only imports
- **Log atteso**: TypeScript error con ciclo di dipendenze

#### Runtime Errors
- **Problema**: Hook chiamati fuori da componenti
- **Soluzione**: Verificare che hook siano in componenti React
- **Log atteso**: "Invalid hook call"

#### Form Validation
- **Problema**: Validazioni non funzionanti
- **Soluzione**: Verificare `useValidation` hook e validators
- **Log atteso**: `[FORM] validation_failed: {field, error}`

### 9.2 Debug Commands

```bash
# Abilita debug mode
VITE_DEBUG=true npm run dev

# Check build senza warning
npm run build 2>&1 | grep -i warning

# Lint check
npm run lint
```

### 9.3 Monitoring Points
- Form submission success/failure rates
- Auth operation completion times
- Component render performance
- Error boundary activation frequency

---

**Questo documento serve come guida completa per il refactoring del progetto Kyroo secondo le linee guida TRAE SOLO Builder. Ogni fase deve essere completata e validata prima di procedere alla successiva.**