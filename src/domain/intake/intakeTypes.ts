/**
 * Types and option constants for the TRT medical intake questionnaire.
 * Centralised here so form components and validation logic share one source.
 */

/** Complete answer set for the 17-step TRT medical intake. */
export interface IntakeAnswers {
  age?: number;
  heightFt?: number;
  heightIn?: number;
  weight?: number;
  symptoms?: string[];
  symptomDuration?: string;
  testedBefore?: string;
  onMedications?: string;
  medicationList?: string;
  conditions?: string[];
  treatedBefore?: string;
  currentlyOnTRT?: string;
  smoke?: string;
  activityLevel?: string;
  energyRating?: number;
  sexHealthRating?: number;
  hasPCP?: string;
  additionalServices?: string[];
  providerNotes?: string;
}

/** Default/initial state for a new intake form session. */
export const INTAKE_DEFAULTS: IntakeAnswers = {
  symptoms: [],
  conditions: [],
  additionalServices: [],
  energyRating: 5,
  sexHealthRating: 5,
  heightFt: 5,
  heightIn: 6,
};

/** Checkbox options for symptom selection (Step 4). */
export const SYMPTOM_OPTIONS = [
  "Low energy", "Decreased libido", "Mood changes", "Poor sleep",
  "Reduced muscle mass", "Weight gain", "Brain fog", "Other",
] as const;

/** Checkbox options for medical conditions (Step 8). */
export const CONDITION_OPTIONS = [
  "Sleep apnea", "Prostate issues", "Heart disease", "Liver disease", "None of the above",
] as const;

/** Checkbox options for additional services interest (Step 16). */
export const SERVICE_OPTIONS = [
  "ED therapy", "Medical weight loss", "Both", "Just TRT",
] as const;

/** Total number of steps in the intake questionnaire. */
export const INTAKE_TOTAL_STEPS = 17;

/**
 * Pure validator — returns true when the given step has a valid answer.
 * Used both for "can advance" gating and pre-submit validation.
 */
export function isStepValid(step: number, answers: IntakeAnswers): boolean {
  switch (step) {
    case 1:  return (answers.age ?? 0) >= 18 && (answers.age ?? 0) <= 99;
    case 2:  return true;
    case 3:  return (answers.weight ?? 0) >= 80 && (answers.weight ?? 0) <= 500;
    case 4:  return (answers.symptoms?.length ?? 0) > 0;
    case 5:  return !!answers.symptomDuration;
    case 6:  return !!answers.testedBefore;
    case 7:  return !!answers.onMedications;
    case 8:  return (answers.conditions?.length ?? 0) > 0;
    case 9:  return !!answers.treatedBefore;
    case 10: return !!answers.currentlyOnTRT;
    case 11: return !!answers.smoke;
    case 12: return !!answers.activityLevel;
    case 13: return true;
    case 14: return true;
    case 15: return !!answers.hasPCP;
    case 16: return (answers.additionalServices?.length ?? 0) > 0;
    case 17: return true;
    default: return false;
  }
}
