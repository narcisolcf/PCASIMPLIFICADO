import { useCallback, useState } from 'react';
import {
  validateCPF,
  validateCNPJ,
  validateDocument,
  validateMonetaryValue,
  formatCPF,
  formatCNPJ,
  formatDocument,
  currencyToNumber,
  numberToCurrency,
} from '@/utils/validators';

interface ValidationError {
  field: string;
  message: string;
}

interface DocumentValidationState {
  errors: ValidationError[];
  isValid: boolean;
}

interface MonetaryValidationResult {
  valid: boolean;
  error?: string;
}

export const useDocumentValidation = () => {
  const [validationState, setValidationState] =
    useState<DocumentValidationState>({
      errors: [],
      isValid: true,
    });

  /**
   * Validate CPF with error state management
   */
  const validateCPFWithState = useCallback(
    (cpf: string, fieldName = 'CPF'): boolean => {
      const isValid = validateCPF(cpf);

      if (!isValid) {
        setValidationState((prev) => ({
          errors: [
            ...prev.errors.filter((e) => e.field !== fieldName),
            { field: fieldName, message: 'CPF inválido' },
          ],
          isValid: false,
        }));
      } else {
        setValidationState((prev) => ({
          errors: prev.errors.filter((e) => e.field !== fieldName),
          isValid: prev.errors.filter((e) => e.field !== fieldName).length === 0,
        }));
      }

      return isValid;
    },
    []
  );

  /**
   * Validate CNPJ with error state management
   */
  const validateCNPJWithState = useCallback(
    (cnpj: string, fieldName = 'CNPJ'): boolean => {
      const isValid = validateCNPJ(cnpj);

      if (!isValid) {
        setValidationState((prev) => ({
          errors: [
            ...prev.errors.filter((e) => e.field !== fieldName),
            { field: fieldName, message: 'CNPJ inválido' },
          ],
          isValid: false,
        }));
      } else {
        setValidationState((prev) => ({
          errors: prev.errors.filter((e) => e.field !== fieldName),
          isValid: prev.errors.filter((e) => e.field !== fieldName).length === 0,
        }));
      }

      return isValid;
    },
    []
  );

  /**
   * Validate document (CPF or CNPJ) with error state management
   */
  const validateDocumentWithState = useCallback(
    (document: string, fieldName = 'Documento'): boolean => {
      const isValid = validateDocument(document);

      if (!isValid) {
        setValidationState((prev) => ({
          errors: [
            ...prev.errors.filter((e) => e.field !== fieldName),
            { field: fieldName, message: 'Documento inválido (CPF/CNPJ)' },
          ],
          isValid: false,
        }));
      } else {
        setValidationState((prev) => ({
          errors: prev.errors.filter((e) => e.field !== fieldName),
          isValid: prev.errors.filter((e) => e.field !== fieldName).length === 0,
        }));
      }

      return isValid;
    },
    []
  );

  /**
   * Validate monetary value with extenso comparison
   */
  const validateMonetaryWithState = useCallback(
    (
      numeric: number,
      extenso: string,
      fieldName = 'Valor'
    ): MonetaryValidationResult => {
      const result = validateMonetaryValue(numeric, extenso);

      if (!result.valid) {
        setValidationState((prev) => ({
          errors: [
            ...prev.errors.filter((e) => e.field !== fieldName),
            { field: fieldName, message: result.error || 'Valor inválido' },
          ],
          isValid: false,
        }));
      } else {
        setValidationState((prev) => ({
          errors: prev.errors.filter((e) => e.field !== fieldName),
          isValid: prev.errors.filter((e) => e.field !== fieldName).length === 0,
        }));
      }

      return result;
    },
    []
  );

  /**
   * Clear validation errors for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState((prev) => ({
      errors: prev.errors.filter((e) => e.field !== fieldName),
      isValid: prev.errors.filter((e) => e.field !== fieldName).length === 0,
    }));
  }, []);

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setValidationState({ errors: [], isValid: true });
  }, []);

  /**
   * Get error message for a specific field
   */
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return validationState.errors.find((e) => e.field === fieldName)?.message;
    },
    [validationState.errors]
  );

  return {
    // State
    validationState,
    isValid: validationState.isValid,
    errors: validationState.errors,

    // Validation functions with state management
    validateCPF: validateCPFWithState,
    validateCNPJ: validateCNPJWithState,
    validateDocument: validateDocumentWithState,
    validateMonetary: validateMonetaryWithState,

    // Pure validation functions (no state)
    validateCPFPure: useCallback(validateCPF, []),
    validateCNPJPure: useCallback(validateCNPJ, []),
    validateDocumentPure: useCallback(validateDocument, []),

    // Formatting functions
    formatCPF: useCallback(formatCPF, []),
    formatCNPJ: useCallback(formatCNPJ, []),
    formatDocument: useCallback(formatDocument, []),

    // Currency utilities
    currencyToNumber: useCallback(currencyToNumber, []),
    numberToCurrency: useCallback(numberToCurrency, []),

    // Error management
    clearFieldError,
    clearAllErrors,
    getFieldError,
  };
};
