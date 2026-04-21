import { useCallback, useState } from 'react';
import { quoteApi } from '../services/api';
import type {
  FormErrors,
  QuoteFormState,
  QuotePayload,
  QuoteResponse,
  StepDriverData,
  StepInsuranceData,
  StepPersonalData,
  StepVehicleData,
} from '../types/quote';
import { validateDriver, validateInsurance, validatePersonal, validateVehicle } from '../utils/validators';

const TOTAL_STEPS = 5;

const initialState: QuoteFormState = {
  currentStep: 1,
  personal: { nom: '', prenom: '', cityId: null, telephone: '' },
  driver: { dateNaissance: '', datePermis: '' },
  insurance: { typeAssurance: '' },
  vehicle: {
    marqueVehicule: '',
    typeCarburant: '',
    dateMiseEnCirculation: '',
    nombrePlaces: '',
    valeurNeuf: '',
    valeurVenale: '',
    immatriculation: '',
    puissanceFiscale: '',
    cylindree: '',
  },
  errors: {},
  isSubmitting: false,
  savedQuote: null,
};

export function useQuoteForm() {
  const [state, setState] = useState<QuoteFormState>(initialState);

  // ─── Setters partiels par étape ───────────────────────────────────────────

  const setPersonal = useCallback((data: Partial<StepPersonalData>) => {
    setState((s) => ({ ...s, personal: { ...s.personal, ...data }, errors: {} }));
  }, []);

  const setDriver = useCallback((data: Partial<StepDriverData>) => {
    setState((s) => ({ ...s, driver: { ...s.driver, ...data }, errors: {} }));
  }, []);

  const setInsurance = useCallback((data: Partial<StepInsuranceData>) => {
    setState((s) => ({ ...s, insurance: { ...s.insurance, ...data }, errors: {} }));
  }, []);

  const setVehicle = useCallback((data: Partial<StepVehicleData>) => {
    setState((s) => ({ ...s, vehicle: { ...s.vehicle, ...data }, errors: {} }));
  }, []);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const validateCurrentStep = useCallback((): FormErrors => {
    const { currentStep, personal, driver, insurance, vehicle } = state;
    switch (currentStep) {
      case 1: return validatePersonal(personal);
      case 2: return validateDriver(driver);
      case 3: return validateInsurance(insurance);
      case 4: return validateVehicle(vehicle, insurance.typeAssurance);
      default: return {};
    }
  }, [state]);

  const nextStep = useCallback(() => {
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setState((s) => ({ ...s, errors }));
      return false;
    }
    setState((s) => ({ ...s, currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS), errors: {} }));
    return true;
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setState((s) => ({ ...s, currentStep: Math.max(s.currentStep - 1, 1), errors: {} }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((s) => ({ ...s, currentStep: step, errors: {} }));
  }, []);

  // ─── Soumission finale ────────────────────────────────────────────────────

  const submit = useCallback(async (): Promise<QuoteResponse | null> => {
    setState((s) => ({ ...s, isSubmitting: true, errors: {} }));

    const { personal, driver, insurance, vehicle } = state;

    const payload: QuotePayload = {
      ...personal,
      ...driver,
      ...insurance,
      ...vehicle,
      typeAssurance: insurance.typeAssurance as QuotePayload['typeAssurance'],
      statut: 'submitted',
    };

    try {
      const result = await quoteApi.create(payload);
      setState((s) => ({ ...s, isSubmitting: false, savedQuote: result.data }));
      return result.data;
    } catch (err: unknown) {
      const apiErr = err as Error & { details?: Record<string, string> };
      const errors: FormErrors = apiErr.details ?? { nom: apiErr.message };
      setState((s) => ({ ...s, isSubmitting: false, errors }));
      return null;
    }
  }, [state]);

  // ─── Sauvegarde brouillon ─────────────────────────────────────────────────

  const saveDraft = useCallback(async () => {
    const { personal, driver, insurance, vehicle } = state;
    const payload: QuotePayload = {
      ...personal,
      ...driver,
      ...insurance,
      ...vehicle,
      typeAssurance: insurance.typeAssurance as QuotePayload['typeAssurance'],
      statut: 'draft',
    };
    try {
      const result = await quoteApi.create(payload);
      setState((s) => ({ ...s, savedQuote: result.data }));
      return result.data;
    } catch {
      return null;
    }
  }, [state]);

  const reset = useCallback(() => setState(initialState), []);

  return {
    state,
    totalSteps: TOTAL_STEPS,
    setPersonal,
    setDriver,
    setInsurance,
    setVehicle,
    nextStep,
    prevStep,
    goToStep,
    submit,
    saveDraft,
    reset,
  };
}
