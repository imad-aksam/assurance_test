import React from 'react';
import type { FormErrors, StepDriverData } from '../../types/quote';
import { FormField, NavButtons } from '../UI';

interface Props {
  data: StepDriverData;
  errors: FormErrors;
  onChange: (data: Partial<StepDriverData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepDriver: React.FC<Props> = ({ data, errors, onChange, onNext, onPrev }) => {
  // Date max pour la naissance (18 ans minimum)
  const maxDateNaissance = new Date();
  maxDateNaissance.setFullYear(maxDateNaissance.getFullYear() - 18);
  const maxDateNaissanceStr = maxDateNaissance.toISOString().split('T')[0];

  // Date max pour le permis = aujourd'hui
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-icon">🪪</span>
        <h2 className="step-title">Informations conducteur</h2>
        <p className="step-subtitle">Ces informations permettent d'évaluer votre profil de risque.</p>
      </div>

      <div className="form-grid">
        <FormField label="Date de naissance" error={errors.dateNaissance} required>
          <input
            type="date"
            className={`form-input ${errors.dateNaissance ? 'input-error' : ''}`}
            value={data.dateNaissance}
            max={maxDateNaissanceStr}
            onChange={(e) => onChange({ dateNaissance: e.target.value })}
          />
        </FormField>

        <FormField label="Date d'obtention du permis" error={errors.datePermis} required>
          <input
            type="date"
            className={`form-input ${errors.datePermis ? 'input-error' : ''}`}
            value={data.datePermis}
            min={
              data.dateNaissance
                ? new Date(
                    new Date(data.dateNaissance).getFullYear() + 16,
                    new Date(data.dateNaissance).getMonth(),
                    new Date(data.dateNaissance).getDate()
                  )
                    .toISOString()
                    .split('T')[0]
                : undefined
            }
            max={today}
            onChange={(e) => onChange({ datePermis: e.target.value })}
          />
        </FormField>
      </div>

      {/* Info contextuelle */}
      <div className="info-box">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <p>
          Le conducteur doit avoir <strong>au moins 18 ans</strong> et le permis doit avoir été
          obtenu après l'âge de 16 ans.
        </p>
      </div>

      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
};

export default StepDriver;
