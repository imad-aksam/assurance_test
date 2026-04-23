import { useCallback, useState } from 'react';
import { quoteApi } from '../services/api';
import { validateDriver, validateInsurance, validatePersonal, validateVehicle } from '../utils/validators';

const TOTAL_STEPS = 5;

const initialState = {
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
  const [state, setState] = useState(initialState);

  const setPersonal = useCallback((data) => {
    setState((s) => ({ ...s, personal: { ...s.personal, ...data }, errors: {} }));
  }, []);

  const setDriver = useCallback((data) => {
    setState((s) => ({ ...s, driver: { ...s.driver, ...data }, errors: {} }));
  }, []);

  const setInsurance = useCallback((data) => {
    setState((s) => ({ ...s, insurance: { ...s.insurance, ...data }, errors: {} }));
  }, []);

  const setVehicle = useCallback((data) => {
    setState((s) => ({ ...s, vehicle: { ...s.vehicle, ...data }, errors: {} }));
  }, []);

  const validateCurrentStep = useCallback(() => {
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

  const goToStep = useCallback((step) => {
    setState((s) => ({ ...s, currentStep: step, errors: {} }));
  }, []);

  const submit = useCallback(async () => {
    setState((s) => ({ ...s, isSubmitting: true, errors: {} }));
    const { personal, driver, insurance, vehicle } = state;
    const payload = {
      ...personal,
      ...driver,
      ...insurance,
      ...vehicle,
      statut: 'submitted',
    };
    try {
      const result = await quoteApi.create(payload);
      setState((s) => ({ ...s, isSubmitting: false, savedQuote: result.data }));
      return result.data;
    } catch (err) {
      const errors = err.details ?? { nom: err.message };
      setState((s) => ({ ...s, isSubmitting: false, errors }));
      return null;
    }
  }, [state]);

  const saveDraft = useCallback(async () => {
    const { personal, driver, insurance, vehicle } = state;
    const payload = { ...personal, ...driver, ...insurance, ...vehicle, statut: 'draft' };
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
