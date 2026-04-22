import React from 'react';

// ─── Barre de progression ─────────────────────────────────────────────────────

export const ProgressBar = ({ currentStep, totalSteps, labels = [] }) => {
  const percent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  return (
    <div className="progress-container">
      <div className="progress-bar-wrapper">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className={`progress-step ${step < currentStep ? 'completed' : step === currentStep ? 'active' : 'pending'}`}>
              <div className="step-dot">
                {step < currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : <span>{step}</span>}
              </div>
              {labels[step - 1] && <span className="step-label">{labels[step - 1]}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Champ de formulaire ──────────────────────────────────────────────────────

export const FormField = ({ label, error, required, children }) => (
  <div className={`form-field ${error ? 'has-error' : ''}`}>
    <label className="field-label">
      {label}
      {required && <span className="required-mark"> *</span>}
    </label>
    {children}
    {error && (
      <p className="field-error">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ─── Boutons de navigation ────────────────────────────────────────────────────

export const NavButtons = ({ onPrev, onNext, onSubmit, isFirst, isLast, isSubmitting, nextLabel = 'Suivant' }) => (
  <div className="nav-buttons">
    {!isFirst && (
      <button type="button" className="btn btn-secondary" onClick={onPrev}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Précédent
      </button>
    )}
    {isLast ? (
      <button type="button" className="btn btn-primary btn-submit" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <><span className="spinner" />Envoi en cours…</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8.5l4 4 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>Confirmer le devis</>
        )}
      </button>
    ) : (
      <button type="button" className="btn btn-primary" onClick={onNext}>
        {nextLabel}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

export const Toast = ({ type, message, onClose }) => (
  <div className={`toast toast-${type}`} role="alert">
    {type === 'success' ? (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 9l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 5v5M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )}
    <span>{message}</span>
    {onClose && <button className="toast-close" onClick={onClose} aria-label="Fermer">×</button>}
  </div>
);
