/**
 * Testes Unitários: useFormularioPCA Hook
 *
 * Cobre:
 * - Validação Zod schemas
 * - Fluxo de submissão bem-sucedido
 * - Tratamento de erros (autenticação, database)
 * - Cálculos automáticos
 * - Gerenciamento de itens (adicionar/remover)
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFormularioPCA, FormularioPCASchema } from './useFormularioPCA';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// MOCKS
// ============================================================================

// Mock do Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// ============================================================================
// HELPERS
// ============================================================================

const MOCK_USER_ID = '12345678-1234-1234-1234-123456789012';
const MOCK_DFD_ID = '87654321-4321-4321-4321-210987654321';
const MOCK_UASG_ID = '11111111-1111-1111-1111-111111111111';
const MOCK_AREA_ID = '22222222-2222-2222-2222-222222222222';

function createValidFormData() {
  return {
    requisitante: {
      unidadeGestoraId: MOCK_UASG_ID,
      unidadeGestoraNome: 'Secretaria de Educação',
      areaRequisitanteId: MOCK_AREA_ID,
      areaRequisitanteNome: 'Diretoria de Ensino',
      responsavel: 'João da Silva',
      cargo: 'Diretor de Ensino',
      email: 'joao.silva@camocim.ce.gov.br',
      telefone: '(88) 99999-9999',
    },
    itens: [
      {
        id: crypto.randomUUID(),
        tipo: 'Material' as const,
        descricao: 'Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD',
        unidadeFornecimento: 'UN',
        quantidade: 10,
        valorUnitario: 3000.0,
        valorTotal: 30000.0,
        prioridade: 'Alta' as const,
        dataPretendida: '2025-06-15',
        justificativa:
          'Equipamentos necessários para modernização do laboratório de informática conforme Plano de Educação Digital Municipal.',
      },
    ],
  };
}

// ============================================================================
// TESTES: Validação Zod Schemas
// ============================================================================

describe('useFormularioPCA - Validação Zod Schemas', () => {
  it('deve validar formulário completo válido', () => {
    const formData = createValidFormData();
    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(true);
  });

  it('deve rejeitar e-mail inválido', () => {
    const formData = createValidFormData();
    formData.requisitante.email = 'email-invalido';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('E-mail inválido');
    }
  });

  it('deve rejeitar telefone inválido', () => {
    const formData = createValidFormData();
    formData.requisitante.telefone = '123456';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Telefone inválido');
    }
  });

  it('deve rejeitar UUID inválido para unidade gestora', () => {
    const formData = createValidFormData();
    formData.requisitante.unidadeGestoraId = 'not-a-uuid';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('ID da unidade gestora inválido');
    }
  });

  it('deve rejeitar descrição muito curta', () => {
    const formData = createValidFormData();
    formData.itens[0].descricao = 'Curta';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('no mínimo 10 caracteres');
    }
  });

  it('deve rejeitar quantidade zero ou negativa', () => {
    const formData = createValidFormData();
    formData.itens[0].quantidade = 0;

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('maior que zero');
    }
  });

  it('deve rejeitar justificativa muito curta', () => {
    const formData = createValidFormData();
    formData.itens[0].justificativa = 'Justificativa curta';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('no mínimo 50 caracteres');
    }
  });

  it('deve rejeitar data fora do exercício 2025', () => {
    const formData = createValidFormData();
    formData.itens[0].dataPretendida = '2024-12-31';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('exercício de 2025');
    }
  });

  it('deve rejeitar tipo de item inválido', () => {
    const formData = createValidFormData();
    // @ts-expect-error - Testando tipo inválido
    formData.itens[0].tipo = 'TipoInvalido';

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
  });

  it('deve rejeitar formulário sem itens', () => {
    const formData = createValidFormData();
    formData.itens = [];

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 1 item');
    }
  });

  it('deve rejeitar mais de 50 itens', () => {
    const formData = createValidFormData();
    formData.itens = Array(51).fill(formData.itens[0]);

    const result = FormularioPCASchema.safeParse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Máximo de 50 itens');
    }
  });
});

// ============================================================================
// TESTES: Hook Functionality
// ============================================================================

describe('useFormularioPCA - Funcionalidades do Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com valores padrão corretos', () => {
    const { result } = renderHook(() => useFormularioPCA());

    expect(result.current.enviando).toBe(false);
    expect(result.current.enviado).toBe(false);
    expect(result.current.resultado).toBeNull();
    expect(result.current.itemsField.fields).toHaveLength(1);
    expect(result.current.form.getValues('itens')).toHaveLength(1);
  });

  it('deve adicionar novo item corretamente', () => {
    const { result } = renderHook(() => useFormularioPCA());

    expect(result.current.itemsField.fields).toHaveLength(1);

    act(() => {
      result.current.adicionarItem();
    });

    expect(result.current.itemsField.fields).toHaveLength(2);
  });

  it('deve remover item corretamente', () => {
    const { result } = renderHook(() => useFormularioPCA());

    // Adicionar 2 itens para poder remover 1
    act(() => {
      result.current.adicionarItem();
    });

    expect(result.current.itemsField.fields).toHaveLength(2);

    act(() => {
      result.current.removerItem(1);
    });

    expect(result.current.itemsField.fields).toHaveLength(1);
  });

  it('não deve permitir remover o último item', () => {
    const { result } = renderHook(() => useFormularioPCA());

    expect(result.current.itemsField.fields).toHaveLength(1);

    act(() => {
      result.current.removerItem(0);
    });

    // Ainda deve ter 1 item (toast é exibido mas item não é removido)
    expect(result.current.itemsField.fields).toHaveLength(1);
  });

  it('deve calcular valor total do item corretamente', () => {
    const { result } = renderHook(() => useFormularioPCA());

    act(() => {
      result.current.form.setValue('itens.0.quantidade', 10);
      result.current.form.setValue('itens.0.valorUnitario', 250.5);
    });

    act(() => {
      result.current.calcularValorTotal(0);
    });

    expect(result.current.form.getValues('itens.0.valorTotal')).toBe(2505.0);
  });

  it('deve resetar formulário corretamente', () => {
    const { result } = renderHook(() => useFormularioPCA());

    // Preencher alguns dados
    act(() => {
      result.current.form.setValue('requisitante.responsavel', 'Teste');
      result.current.adicionarItem();
    });

    expect(result.current.itemsField.fields).toHaveLength(2);
    expect(result.current.form.getValues('requisitante.responsavel')).toBe('Teste');

    // Resetar
    act(() => {
      result.current.resetarFormulario();
    });

    expect(result.current.itemsField.fields).toHaveLength(1);
    expect(result.current.form.getValues('requisitante.responsavel')).toBe('');
  });
});

// ============================================================================
// TESTES: submitPCA - Fluxo de Sucesso
// ============================================================================

describe('useFormularioPCA - submitPCA - Sucesso', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de autenticação bem-sucedida
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } as any },
      error: null,
    });

    // Mock de inserção de DFD bem-sucedida
    const mockDFDInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: MOCK_DFD_ID },
        error: null,
      }),
    };

    // Mock de inserção de itens bem-sucedida
    const mockItemsInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    // Mock de inserção de responsável bem-sucedida
    const mockResponsavelInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    // Configurar mock do supabase.from()
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'dfds') {
        return {
          insert: vi.fn().mockReturnValue(mockDFDInsert),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        } as any;
      }
      if (table === 'materiais_servicos') {
        return {
          insert: mockItemsInsert,
        } as any;
      }
      if (table === 'responsaveis_dfd') {
        return {
          insert: mockResponsavelInsert,
        } as any;
      }
      return {} as any;
    });
  });

  it('deve enviar formulário com sucesso', async () => {
    const { result } = renderHook(() => useFormularioPCA());
    const formData = createValidFormData();

    // Preencher formulário
    act(() => {
      result.current.form.setValue('requisitante', formData.requisitante);
      result.current.form.setValue('itens', formData.itens);
    });

    // Enviar
    await act(async () => {
      await result.current.submitPCA(formData);
    });

    // Verificar estado do hook
    expect(result.current.enviado).toBe(true);
    expect(result.current.resultado?.sucesso).toBe(true);
    expect(result.current.resultado?.dados?.pcaId).toBe(MOCK_DFD_ID);
    expect(result.current.resultado?.dados?.numeroItens).toBe(1);
    expect(result.current.resultado?.dados?.valorTotal).toBe(30000.0);

    // Verificar chamadas ao Supabase
    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('dfds');
    expect(supabase.from).toHaveBeenCalledWith('materiais_servicos');
    expect(supabase.from).toHaveBeenCalledWith('responsaveis_dfd');
  });
});

// ============================================================================
// TESTES: submitPCA - Erros
// ============================================================================

describe('useFormularioPCA - submitPCA - Erros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar se usuário não estiver autenticado', async () => {
    const { result } = renderHook(() => useFormularioPCA());
    const formData = createValidFormData();

    // Mock de autenticação falhada
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated', name: 'AuthError', status: 401 } as any,
    });

    // Tentar enviar
    await act(async () => {
      try {
        await result.current.submitPCA(formData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.enviado).toBe(false);
    expect(result.current.resultado?.sucesso).toBe(false);
    expect(result.current.resultado?.mensagem).toContain('autenticado');
  });

  it('deve fazer rollback se inserção de itens falhar', async () => {
    const { result } = renderHook(() => useFormularioPCA());
    const formData = createValidFormData();

    // Mock de autenticação bem-sucedida
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } as any },
      error: null,
    });

    // Mock de DFD inserido com sucesso
    const mockDFDInsert = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: MOCK_DFD_ID },
        error: null,
      }),
    };

    // Mock de inserção de itens falhada
    const mockItemsInsert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: 'PGRST000' },
    });

    // Mock de delete para rollback
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'dfds') {
        return {
          insert: vi.fn().mockReturnValue(mockDFDInsert),
          delete: mockDelete,
          eq: mockEq,
        } as any;
      }
      if (table === 'materiais_servicos') {
        return {
          insert: mockItemsInsert,
        } as any;
      }
      return {} as any;
    });

    // Tentar enviar
    await act(async () => {
      try {
        await result.current.submitPCA(formData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    // Verificar que rollback foi executado
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', MOCK_DFD_ID);

    // Verificar estado de erro
    expect(result.current.enviado).toBe(false);
    expect(result.current.resultado?.sucesso).toBe(false);
    expect(result.current.resultado?.mensagem).toContain('Falha ao salvar itens');
  });
});
