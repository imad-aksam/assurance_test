import React from 'react';
import { useCities } from '../hooks/useReferential';
import { useQuoteForm } from '../hooks/useQuoteForm';
import { ProgressBar } from '../components/UI';
import StepPersonal from '../components/steps/StepPersonal';
import StepDriver from '../components/steps/StepDriver';
import StepInsurance from '../components/steps/StepInsurance';
import StepVehicle from '../components/steps/StepVehicle';
import StepSummary from '../components/steps/StepSummary';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { quoteApi } from '../services/api';






const STEP_LABELS = ['Personnel', 'Conducteur', 'Assurance', 'Véhicule', 'Récap'];

const QuoteFormPage = () => {
  const form = useQuoteForm();
  const { cities } = useCities();
  const { state, totalSteps } = form;


  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      const payload = {
        ...state.personal,
        ...state.driver,
        ...state.insurance,
        ...state.vehicle,
      };
      const res = await quoteApi.create(payload);
      
      navigate('/estimation', { state: { quoteData: payload, quoteId: res?.data?.id, payload } });
    } catch (err) {
      console.error('Erreur soumission:', err);
    }
  };

  return (
    <div className="page-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <a href="https://www.aksam-assurances.fr/">
              <img src={logo} alt="AssurDevis" />
            </a>
          </div>
          <div className="header-meta">
            <span className="header-step-label">Besion d'aide?</span>
            <br />
            <a href="tel:0182834800">0182834800</a>
          </div>
        </div>
      </header>

      <div className="progress-wrapper">
        <ProgressBar currentStep={state.currentStep} totalSteps={totalSteps} labels={STEP_LABELS} />
      </div>

      <main className="form-main">
        <div className="form-card">
          {state.currentStep === 1 && (
            <StepPersonal data={state.personal} errors={state.errors}
              onChange={form.setPersonal} onNext={form.nextStep} />
          )}
          {state.currentStep === 2 && (
            <StepDriver data={state.driver} errors={state.errors}
              onChange={form.setDriver} onNext={form.nextStep} onPrev={form.prevStep} />
          )}
          {state.currentStep === 3 && (
            <StepInsurance data={state.insurance} errors={state.errors}
              onChange={form.setInsurance} onNext={form.nextStep} onPrev={form.prevStep} />
          )}
          {state.currentStep === 4 && (
            <StepVehicle data={state.vehicle} errors={state.errors}
              insuranceType={state.insurance.typeAssurance}
              onChange={form.setVehicle} onNext={form.nextStep} onPrev={form.prevStep} />
          )}
          {state.currentStep === 5 && (
            <StepSummary state={state} cities={cities}
              onConfirm={form.submit} onPrev={form.prevStep}
              onEdit={form.goToStep} savedQuote={state.savedQuote} />
          )}
        </div>

      </main>
    </div>
  );
};


export default QuoteFormPage;