import React from 'react';
import { useCities } from '../../hooks/useReferential';
import { FormField, NavButtons } from '../UI';

const StepPersonal = ({ data, errors, onChange, onNext }) => {
  const { cities, loading: loadingCities } = useCities();
  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-icon">👤</span>
        <h2 className="step-title">Informations personnelles</h2>
        <p className="step-subtitle">Renseignez vos coordonnées pour commencer votre devis.</p>
      </div>
      <div className="form-grid">
        <FormField label="Nom" error={errors.nom} required>
          <input type="text" className={`form-input ${errors.nom ? 'input-error' : ''}`}
            placeholder="Ex : Benali" value={data.nom}
            onChange={(e) => onChange({ nom: e.target.value })} autoComplete="family-name" />
        </FormField>
        <FormField label="Prénom" error={errors.prenom} required>
          <input type="text" className={`form-input ${errors.prenom ? 'input-error' : ''}`}
            placeholder="Ex : Mohammed" value={data.prenom}
            onChange={(e) => onChange({ prenom: e.target.value })} autoComplete="given-name" />
        </FormField>
        <FormField label="Ville" error={errors.cityId} required>
          <div className="select-wrapper">
            <select className={`form-select ${errors.cityId ? 'input-error' : ''}`}
              value={data.cityId ?? ''} disabled={loadingCities}
              onChange={(e) => onChange({ cityId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">{loadingCities ? 'Chargement…' : 'Sélectionnez votre ville'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.nom} — {city.codePostal}</option>
              ))}
            </select>
            <span className="select-arrow">▾</span>
          </div>
        </FormField>
        <FormField label="Numéro de téléphone" error={errors.telephone} required>
          <input type="tel" className={`form-input ${errors.telephone ? 'input-error' : ''}`}
            placeholder="Ex : 0612345678" value={data.telephone}
            onChange={(e) => onChange({ telephone: e.target.value })} autoComplete="tel" />
        </FormField>
      </div>
      <NavButtons isFirst onNext={onNext} />
    </div>
  );
};

export default StepPersonal;
