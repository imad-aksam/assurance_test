// ─── Types partagés du module devis ──────────────────────────────────────────

export type InsuranceType = 'auto' | 'moto';
export type FuelType = 'essence' | 'diesel' | 'hybride' | 'electrique' | 'gpl';
export type QuoteStatus = 'draft' | 'submitted' | 'confirmed';

export interface City {
  id: number;
  nom: string;
  codePostal: string;
  region: string;
}

export interface VehicleBrand {
  id: number;
  nom: string;
  typeVehicule: InsuranceType;
}

// ─── Données du formulaire multi-étapes ──────────────────────────────────────

export interface StepPersonalData {
  nom: string;
  prenom: string;
  cityId: number | null;
  telephone: string;
}

export interface StepDriverData {
  dateNaissance: string;
  datePermis: string;
}

export interface StepInsuranceData {
  typeAssurance: InsuranceType | '';
}

export interface StepVehicleData {
  marqueVehicule: string;
  typeCarburant: FuelType | '';
  dateMiseEnCirculation: string;
  nombrePlaces: number | '';
  valeurNeuf: number | '';
  valeurVenale: number | '';
  immatriculation: string;
  // Conditionnel Auto
  puissanceFiscale: number | '';
  // Conditionnel Moto
  cylindree: number | '';
}

/** Payload complet envoyé à l'API */
export interface QuotePayload
  extends StepPersonalData,
    StepDriverData,
    StepInsuranceData,
    StepVehicleData {
  statut: QuoteStatus;
}

/** Réponse de l'API après création */
export interface QuoteResponse extends QuotePayload {
  id: number;
  cityNom: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Erreurs de validation ────────────────────────────────────────────────────

export type FormErrors = Partial<Record<keyof QuotePayload, string>>;

// ─── État global du formulaire ────────────────────────────────────────────────

export interface QuoteFormState {
  currentStep: number;
  personal: StepPersonalData;
  driver: StepDriverData;
  insurance: StepInsuranceData;
  vehicle: StepVehicleData;
  errors: FormErrors;
  isSubmitting: boolean;
  savedQuote: QuoteResponse | null;
}
