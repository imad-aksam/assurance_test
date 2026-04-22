import React from 'react';
import { NavButtons } from '../UI';

const INSURANCE_OPTIONS = [
  {
    value: 'auto',
    label: 'Assurance Auto',
    description: 'Pour votre voiture particulière ou utilitaire',
    features: ['Responsabilité civile obligatoire', 'Protection tous risques disponible', 'Assistance 24h/24 et 7j/7', 'Bris de glace inclus'],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="16" width="36" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M12 16l4-8h16l4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="14" cy="36" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="34" cy="36" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    value: 'moto',
    label: 'Assurance Moto',
    description: 'Pour votre moto, scooter ou cyclomoteur',
    features: ['Responsabilité civile obligatoire', 'Protection du pilote incluse', 'Vol et incendie disponibles', 'Équipements assurés en option'],
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="34" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="36" cy="34" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M18 34h12M24 28V18l8-4M16 22l8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M28 14h6l4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

const StepInsurance = ({ data, errors, onChange, onNext, onPrev }) => (
  <div className="step-container">
    <div className="step-header">
      <span className="step-icon">🛡️</span>
      <h2 className="step-title">Type d'assurance</h2>
      <p className="step-subtitle">Choisissez le type de véhicule que vous souhaitez assurer.</p>
    </div>
    {errors.typeAssurance && (
      <p className="field-error mb-4">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {errors.typeAssurance}
      </p>
    )}
    <div className="insurance-cards">
      {INSURANCE_OPTIONS.map((option) => (
        <button key={option.value} type="button"
          className={`insurance-card ${data.typeAssurance === option.value ? 'selected' : ''}`}
          onClick={() => onChange({ typeAssurance: option.value })}>
          <div className="card-icon">{option.icon}</div>
          <h3 className="card-title">{option.label}</h3>
          <p className="card-description">{option.description}</p>
          <ul className="card-features">
            {option.features.map((f) => (
              <li key={f}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.15" />
                  <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {data.typeAssurance === option.value && <div className="card-selected-badge">Sélectionné</div>}
        </button>
      ))}
    </div>
    <NavButtons onPrev={onPrev} onNext={onNext} />
  </div>
);

export default StepInsurance;
