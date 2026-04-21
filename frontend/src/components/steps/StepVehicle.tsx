import React from 'react';
import { useVehicleBrands } from '../../hooks/useReferential';
import type { FormErrors, InsuranceType, StepVehicleData } from '../../types/quote';
import { FormField, NavButtons } from '../UI';

interface Props {
  data: StepVehicleData;
  errors: FormErrors;
  insuranceType: InsuranceType | '';
  onChange: (data: Partial<StepVehicleData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const FUEL_TYPES = [
  { value: 'essence', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybride', label: 'Hybride' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'gpl', label: 'GPL' },
];

const StepVehicle: React.FC<Props> = ({
  data,
  errors,
  insuranceType,
  onChange,
  onNext,
  onPrev,
}) => {
  const { brands, loading: loadingBrands } = useVehicleBrands(insuranceType);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="step-container">
      <div className="step-header">
        <span className="step-icon">
          {insuranceType === 'moto' ? '🏍️' : '🚗'}
        </span>
        <h2 className="step-title">Informations véhicule</h2>
        <p className="step-subtitle">
          Renseignez les caractéristiques de votre{' '}
          {insuranceType === 'moto' ? 'moto' : 'véhicule'}.
        </p>
      </div>

      <div className="form-grid">
        {/* Marque */}
        <FormField label="Marque du véhicule" error={errors.marqueVehicule} required>
          <div className="select-wrapper">
            <select
              className={`form-select ${errors.marqueVehicule ? 'input-error' : ''}`}
              value={data.marqueVehicule}
              onChange={(e) => onChange({ marqueVehicule: e.target.value })}
              disabled={loadingBrands}
            >
              <option value="">
                {loadingBrands ? 'Chargement…' : 'Sélectionnez une marque'}
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.nom}>{b.nom}</option>
              ))}
            </select>
            <span className="select-arrow">▾</span>
          </div>
        </FormField>

        {/* Type de carburant */}
        <FormField label="Type de carburant" error={errors.typeCarburant} required>
          <div className="select-wrapper">
            <select
              className={`form-select ${errors.typeCarburant ? 'input-error' : ''}`}
              value={data.typeCarburant}
              onChange={(e) => onChange({ typeCarburant: e.target.value as StepVehicleData['typeCarburant'] })}
            >
              <option value="">Sélectionnez un carburant</option>
              {FUEL_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <span className="select-arrow">▾</span>
          </div>
        </FormField>

        {/* Date de mise en circulation */}
        <FormField label="Date de mise en circulation" error={errors.dateMiseEnCirculation} required>
          <input
            type="date"
            className={`form-input ${errors.dateMiseEnCirculation ? 'input-error' : ''}`}
            value={data.dateMiseEnCirculation}
            max={today}
            onChange={(e) => onChange({ dateMiseEnCirculation: e.target.value })}
          />
        </FormField>

        {/* Nombre de places */}
        <FormField label="Nombre de places" error={errors.nombrePlaces} required>
          <input
            type="number"
            className={`form-input ${errors.nombrePlaces ? 'input-error' : ''}`}
            placeholder="Ex : 5"
            value={data.nombrePlaces}
            min={1}
            max={9}
            onChange={(e) => onChange({ nombrePlaces: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        </FormField>

        {/* Valeur à neuf */}
        <FormField label="Valeur à neuf (MAD)" error={errors.valeurNeuf} required>
          <input
            type="number"
            className={`form-input ${errors.valeurNeuf ? 'input-error' : ''}`}
            placeholder="Ex : 180000"
            value={data.valeurNeuf}
            min={0}
            step={1000}
            onChange={(e) => onChange({ valeurNeuf: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        </FormField>

        {/* Valeur vénale */}
        <FormField label="Valeur vénale (MAD)" error={errors.valeurVenale} required>
          <input
            type="number"
            className={`form-input ${errors.valeurVenale ? 'input-error' : ''}`}
            placeholder="Ex : 120000"
            value={data.valeurVenale}
            min={0}
            step={1000}
            onChange={(e) => onChange({ valeurVenale: e.target.value === '' ? '' : Number(e.target.value) })}
          />
        </FormField>

        {/* Immatriculation */}
        <FormField label="Immatriculation" error={errors.immatriculation} required>
          <input
            type="text"
            className={`form-input ${errors.immatriculation ? 'input-error' : ''}`}
            placeholder="Ex : 12345A"
            value={data.immatriculation}
            onChange={(e) => onChange({ immatriculation: e.target.value.toUpperCase() })}
            maxLength={10}
          />
        </FormField>

        {/* ── Champ conditionnel : Auto → Puissance fiscale ─────────────────── */}
        {insuranceType === 'auto' && (
          <FormField label="Puissance fiscale (CV)" error={errors.puissanceFiscale} required>
            <input
              type="number"
              className={`form-input ${errors.puissanceFiscale ? 'input-error' : ''}`}
              placeholder="Ex : 8"
              value={data.puissanceFiscale}
              min={1}
              onChange={(e) =>
                onChange({ puissanceFiscale: e.target.value === '' ? '' : Number(e.target.value) })
              }
            />
          </FormField>
        )}

        {/* ── Champ conditionnel : Moto → Cylindrée ────────────────────────── */}
        {insuranceType === 'moto' && (
          <FormField label="Cylindrée (cm³)" error={errors.cylindree} required>
            <input
              type="number"
              className={`form-input ${errors.cylindree ? 'input-error' : ''}`}
              placeholder="Ex : 650"
              value={data.cylindree}
              min={50}
              step={25}
              onChange={(e) =>
                onChange({ cylindree: e.target.value === '' ? '' : Number(e.target.value) })
              }
            />
          </FormField>
        )}
      </div>

      <NavButtons onPrev={onPrev} onNext={onNext} />
    </div>
  );
};

export default StepVehicle;
