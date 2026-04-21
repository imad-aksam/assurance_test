import type {
  FormErrors,
  StepDriverData,
  StepInsuranceData,
  StepPersonalData,
  StepVehicleData,
} from '../types/quote';

// ─── Étape 1 : Informations personnelles ──────────────────────────────────────

export function validatePersonal(data: StepPersonalData): FormErrors {
  const errors: FormErrors = {};

  if (!data.nom.trim()) errors.nom = 'Le nom est obligatoire.';
  else if (data.nom.trim().length < 2) errors.nom = 'Le nom doit contenir au moins 2 caractères.';

  if (!data.prenom.trim()) errors.prenom = 'Le prénom est obligatoire.';
  else if (data.prenom.trim().length < 2) errors.prenom = 'Le prénom doit contenir au moins 2 caractères.';

  if (!data.cityId) errors.cityId = 'Veuillez sélectionner une ville.';

  if (!data.telephone.trim()) {
    errors.telephone = 'Le numéro de téléphone est obligatoire.';
  } else if (!/^(\+212|0)([ -]?[0-9]){9}$/.test(data.telephone.trim())) {
    errors.telephone = 'Format invalide. Ex : 0612345678 ou +212612345678';
  }

  return errors;
}

// ─── Étape 2 : Informations conducteur ───────────────────────────────────────

export function validateDriver(data: StepDriverData): FormErrors {
  const errors: FormErrors = {};

  if (!data.dateNaissance) {
    errors.dateNaissance = 'La date de naissance est obligatoire.';
  } else {
    const naissance = new Date(data.dateNaissance);
    const now = new Date();
    const age = now.getFullYear() - naissance.getFullYear();
    if (age < 18) errors.dateNaissance = 'Le conducteur doit avoir au moins 18 ans.';
    if (naissance > now) errors.dateNaissance = 'La date de naissance ne peut pas être dans le futur.';
  }

  if (!data.datePermis) {
    errors.datePermis = 'La date d\'obtention du permis est obligatoire.';
  } else {
    const permis = new Date(data.datePermis);
    const now = new Date();
    if (permis > now) errors.datePermis = 'La date du permis ne peut pas être dans le futur.';

    if (data.dateNaissance) {
      const naissance = new Date(data.dateNaissance);
      const agePermis =
        permis.getFullYear() -
        naissance.getFullYear() -
        (permis < new Date(permis.getFullYear(), naissance.getMonth(), naissance.getDate()) ? 1 : 0);
      if (agePermis < 16)
        errors.datePermis = 'Le permis doit avoir été obtenu après l\'âge de 16 ans.';
    }
  }

  return errors;
}

// ─── Étape 3 : Type d'assurance ───────────────────────────────────────────────

export function validateInsurance(data: StepInsuranceData): FormErrors {
  const errors: FormErrors = {};
  if (!data.typeAssurance) errors.typeAssurance = 'Veuillez choisir un type d\'assurance.';
  return errors;
}

// ─── Étape 4 : Informations véhicule ─────────────────────────────────────────

export function validateVehicle(
  data: StepVehicleData,
  type: string
): FormErrors {
  const errors: FormErrors = {};

  if (!data.marqueVehicule) errors.marqueVehicule = 'La marque du véhicule est obligatoire.';
  if (!data.typeCarburant) errors.typeCarburant = 'Le type de carburant est obligatoire.';

  if (!data.dateMiseEnCirculation) {
    errors.dateMiseEnCirculation = 'La date de mise en circulation est obligatoire.';
  } else if (new Date(data.dateMiseEnCirculation) > new Date()) {
    errors.dateMiseEnCirculation = 'Cette date ne peut pas être dans le futur.';
  }

  if (data.nombrePlaces === '' || data.nombrePlaces === null) {
    errors.nombrePlaces = 'Le nombre de places est obligatoire.';
  } else if (Number(data.nombrePlaces) < 1 || Number(data.nombrePlaces) > 9) {
    errors.nombrePlaces = 'Le nombre de places doit être entre 1 et 9.';
  }

  if (data.valeurNeuf === '' || data.valeurNeuf === null) {
    errors.valeurNeuf = 'La valeur à neuf est obligatoire.';
  } else if (Number(data.valeurNeuf) <= 0) {
    errors.valeurNeuf = 'La valeur à neuf doit être positive.';
  }

  if (data.valeurVenale === '' || data.valeurVenale === null) {
    errors.valeurVenale = 'La valeur vénale est obligatoire.';
  } else if (Number(data.valeurVenale) <= 0) {
    errors.valeurVenale = 'La valeur vénale doit être positive.';
  } else if (
    data.valeurNeuf !== '' &&
    Number(data.valeurVenale) > Number(data.valeurNeuf)
  ) {
    errors.valeurVenale = 'La valeur vénale ne peut pas dépasser la valeur à neuf.';
  }

  if (!data.immatriculation.trim()) {
    errors.immatriculation = 'L\'immatriculation est obligatoire.';
  } else if (!/^[A-Z0-9\-]{2,10}$/i.test(data.immatriculation.trim())) {
    errors.immatriculation = 'Format d\'immatriculation invalide (ex: 12345A).';
  }

  if (type === 'auto') {
    if (!data.puissanceFiscale && data.puissanceFiscale !== 0) {
      errors.puissanceFiscale = 'La puissance fiscale est obligatoire pour une auto.';
    } else if (Number(data.puissanceFiscale) <= 0) {
      errors.puissanceFiscale = 'La puissance fiscale doit être positive.';
    }
  }

  if (type === 'moto') {
    if (!data.cylindree && data.cylindree !== 0) {
      errors.cylindree = 'La cylindrée est obligatoire pour une moto.';
    } else if (Number(data.cylindree) <= 0) {
      errors.cylindree = 'La cylindrée doit être positive.';
    }
  }

  return errors;
}
