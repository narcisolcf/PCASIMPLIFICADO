import { describe, it, expect } from 'vitest';
import { numberToCurrency } from '../utils/validators';

describe('numberToCurrency', () => {
    it('formats number to BRL currency string correctly', () => {
        const value = 1234.56;
        const formatted = numberToCurrency(value);
        // Expecting R$ 1.234,56
        // Note: \s matches non-breaking space (0xA0) which is often used in currency formatting
        expect(formatted).toMatch(/R\$\s1\.234,56/);
    });

    it('formats zero correctly', () => {
        const formatted = numberToCurrency(0);
        expect(formatted).toMatch(/R\$\s0,00/);
    });
});
