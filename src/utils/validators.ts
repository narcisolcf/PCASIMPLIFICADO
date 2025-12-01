/**
 * Pure validation functions for fiscal documents
 * Uses modulo 11 algorithm for CPF/CNPJ verification
 */

/**
 * Removes non-numeric characters from string
 */
const sanitizeNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Validates CPF using modulo 11 algorithm
 */
export const validateCPF = (cpf: string): boolean => {
  const sanitized = sanitizeNumeric(cpf);

  if (sanitized.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(sanitized)) return false; // All same digits

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(sanitized.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(sanitized.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  return (
    parseInt(sanitized.charAt(9)) === digit1 &&
    parseInt(sanitized.charAt(10)) === digit2
  );
};

/**
 * Validates CNPJ using modulo 11 algorithm
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const sanitized = sanitizeNumeric(cnpj);

  if (sanitized.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(sanitized)) return false; // All same digits

  // Calculate first verification digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(sanitized.charAt(i)) * weights1[i];
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  // Calculate second verification digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(sanitized.charAt(i)) * weights2[i];
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  return (
    parseInt(sanitized.charAt(12)) === digit1 &&
    parseInt(sanitized.charAt(13)) === digit2
  );
};

/**
 * Validates CPF or CNPJ automatically based on length
 */
export const validateDocument = (document: string): boolean => {
  const sanitized = sanitizeNumeric(document);

  if (sanitized.length === 11) {
    return validateCPF(sanitized);
  } else if (sanitized.length === 14) {
    return validateCNPJ(sanitized);
  }

  return false;
};

/**
 * Converts Brazilian currency string to number
 * Examples: "R$ 1.234,56" -> 1234.56
 */
export const currencyToNumber = (value: string): number => {
  return parseFloat(
    value
      .replace(/[^\d,.-]/g, '') // Remove currency symbols
      .replace(/\./g, '') // Remove thousand separators
      .replace(',', '.') // Replace decimal comma with dot
  );
};

/**
 * Converts number to Brazilian currency string
 * Example: 1234.56 -> "R$ 1.234,56"
 */
export const numberToCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Validates if numeric value matches written form (extenso)
 * Structure prepared for future implementation of extenso comparison
 */
export const validateMonetaryValue = (
  numeric: number,
  extenso: string
): { valid: boolean; error?: string } => {
  // Basic validation
  if (isNaN(numeric) || numeric < 0) {
    return {
      valid: false,
      error: 'Valor numérico inválido',
    };
  }

  if (!extenso || extenso.trim().length === 0) {
    return {
      valid: false,
      error: 'Valor por extenso não pode estar vazio',
    };
  }

  // TODO: Implement extenso-to-number conversion and comparison
  // For now, return valid if both values are present
  return { valid: true };
};

/**
 * Format CPF: 123.456.789-01
 */
export const formatCPF = (cpf: string): string => {
  const sanitized = sanitizeNumeric(cpf);
  if (sanitized.length !== 11) return cpf;

  return sanitized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Format CNPJ: 12.345.678/0001-90
 */
export const formatCNPJ = (cnpj: string): string => {
  const sanitized = sanitizeNumeric(cnpj);
  if (sanitized.length !== 14) return cnpj;

  return sanitized.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
};

/**
 * Format document (CPF or CNPJ) automatically
 */
export const formatDocument = (document: string): string => {
  const sanitized = sanitizeNumeric(document);

  if (sanitized.length === 11) {
    return formatCPF(sanitized);
  } else if (sanitized.length === 14) {
    return formatCNPJ(sanitized);
  }

  return document;
};
