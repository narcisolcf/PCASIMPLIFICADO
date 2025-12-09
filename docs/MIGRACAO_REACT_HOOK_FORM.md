# 📘 Guia de Migração: useState → react-hook-form

**Versão:** 2.0
**Data:** 09/12/2024
**Autor:** Claude Code AI Assistant

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Motivação](#motivação)
3. [Breaking Changes](#breaking-changes)
4. [Guia de Migração por Componente](#guia-de-migração-por-componente)
5. [Padrões e Convenções](#padrões-e-convenções)
6. [Troubleshooting](#troubleshooting)
7. [Testing](#testing)

---

## 🎯 Visão Geral

### O que mudou?

O formulário PCA foi completamente refatorado de **useState manual** para **react-hook-form + Zod**, seguindo os princípios de **Separation of Concerns (SoC)** e **Type Safety**.

### Componentes afetados

- ✅ `useFormularioPCA.ts` - Hook de lógica (reescrito)
- ✅ `DadosRequisitante.tsx` - Componente de apresentação (adaptado)
- ✅ `ItemContratacao.tsx` - Componente de apresentação (adaptado)
- ✅ `FormularioPCA.tsx` - Orquestrador (adaptado)

### Arquivos novos

- ✅ `useFormularioPCA.test.ts` - Testes unitários (20 testes)
- ✅ `docs/MIGRACAO_REACT_HOOK_FORM.md` - Este documento

---

## 💡 Motivação

### Por que migrar?

#### ❌ Problemas do código anterior (useState)

```typescript
// ❌ Lógica misturada com I/O
const [requisitante, setRequisitante] = useState<DadosRequisitante>({...});
const [itens, setItens] = useState<ItemContratacao[]>([]);
const [erros, setErros] = useState<any>({});

// ❌ Validação manual propensa a erros
function validarRequisitante() {
  const novosErros: any = {};
  if (!requisitante.email.includes('@')) {
    novosErros.email = 'E-mail inválido';
  }
  setErros(novosErros);
}

// ❌ Sincronização manual de estado
function atualizarItem(index: number, item: ItemContratacao) {
  const novosItens = [...itens];
  novosItens[index] = item;
  setItens(novosItens);
}
```

**Problemas:**
- ✗ Violação de SoC (hook mistura lógica, validação e I/O)
- ✗ Validação manual propensa a erros
- ✗ Sem type safety nas validações
- ✗ Estado duplicado entre componente e hook
- ✗ Sincronização manual complexa
- ✗ Difícil de testar

#### ✅ Benefícios do novo código (react-hook-form + Zod)

```typescript
// ✅ Schemas Zod: Validação declarativa e type-safe
const DadosRequisitanteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  telefone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  // ...
});

// ✅ Hook focado apenas em lógica
const form = useForm<FormularioPCAData>({
  resolver: zodResolver(FormularioPCASchema),
  mode: "onChange", // Validação em tempo real
});

// ✅ Componentes puros de apresentação
export function DadosRequisitante({ form }: Props) {
  return (
    <Input {...form.register("requisitante.responsavel")} />
  );
}
```

**Benefícios:**
- ✓ **SoC completo:** Hook = lógica, Componente = apresentação
- ✓ **Type safety:** Zod schemas geram tipos TypeScript
- ✓ **Validação robusta:** Regex, refinements, custom validators
- ✓ **Performance:** react-hook-form otimiza re-renders
- ✓ **Testabilidade:** Fácil de mockar e testar
- ✓ **Manutenibilidade:** Código declarativo e legível

---

## 🔴 Breaking Changes

### 1. API do Hook `useFormularioPCA`

#### ❌ API Antiga (useState)

```typescript
const {
  requisitante,              // Estado do requisitante
  itens,                     // Array de itens
  erros,                     // Objeto de erros
  enviando,
  enviado,
  resultadoEnvio,
  setRequisitante,           // Setter manual
  adicionarItem,
  atualizarItem,             // Atualizar item por index
  removerItem,
  enviarFormulario,          // Função de envio
  resetarFormulario,
} = useFormularioPCA();
```

#### ✅ API Nova (react-hook-form)

```typescript
const {
  form,                      // UseFormReturn instance
  itemsField,                // FieldArray methods
  enviando,
  enviado,
  resultado,                 // ResultadoEnvioPCA (renomeado)
  submitPCA,                 // Função de envio (renomeado)
  resetarFormulario,
  adicionarItem,
  removerItem,
  calcularValorTotal,        // Nova função auxiliar
  criarItemVazio,            // Nova função auxiliar
} = useFormularioPCA();
```

**Mudanças principais:**
- `resultadoEnvio` → `resultado`
- `enviarFormulario` → `submitPCA`
- `atualizarItem` → **Removido** (use `form.setValue()`)
- `setRequisitante` → **Removido** (use `form.setValue()`)
- `erros` → **Removido** (use `form.formState.errors`)
- **Adicionados:** `calcularValorTotal`, `criarItemVazio`

---

### 2. Props dos Componentes

#### DadosRequisitante.tsx

```typescript
// ❌ ANTES
interface Props {
  dados: DadosRequisitante;
  onChange: (dados: DadosRequisitante) => void;
  erros?: any;
}

// ✅ DEPOIS
interface Props {
  form: UseFormReturn<FormularioPCAData>;
}
```

#### ItemContratacao.tsx

```typescript
// ❌ ANTES
interface Props {
  item: ItemContratacao;
  numero: number;
  onChange: (item: ItemContratacao) => void;
  onRemover: () => void;
  podeRemover: boolean;
}

// ✅ DEPOIS
interface Props {
  form: UseFormReturn<FormularioPCAData>;
  index: number;
  numero: number;
  onRemover: () => void;
  podeRemover: boolean;
  calcularValorTotal: (index: number) => void;
}
```

---

## 🔧 Guia de Migração por Componente

### 1. Migrando `DadosRequisitante.tsx`

#### Passo 1: Atualizar Props

```typescript
// ❌ ANTES
interface Props {
  dados: DadosRequisitante;
  onChange: (dados: DadosRequisitante) => void;
  erros?: any;
}

export function DadosRequisitante({ dados, onChange, erros }: Props) {
  // ...
}

// ✅ DEPOIS
import { UseFormReturn } from "react-hook-form";
import { FormularioPCAData } from "@/hooks/useFormularioPCA";

interface Props {
  form: UseFormReturn<FormularioPCAData>;
}

export function DadosRequisitante({ form }: Props) {
  // ...
}
```

#### Passo 2: Usar `form.watch()` para valores reativos

```typescript
// ❌ ANTES
function DadosRequisitante({ dados }: Props) {
  // Acessa dados.unidadeGestoraId diretamente
  const unidadeId = dados.unidadeGestoraId;
}

// ✅ DEPOIS
function DadosRequisitante({ form }: Props) {
  // Watch para reagir a mudanças
  const unidadeGestoraId = form.watch("requisitante.unidadeGestoraId");
}
```

#### Passo 3: Extrair erros de `form.formState.errors`

```typescript
// ❌ ANTES
<Input className={erros?.responsavel ? "border-red-500" : ""} />
{erros?.responsavel && <p>{erros.responsavel}</p>}

// ✅ DEPOIS
const errors = form.formState.errors.requisitante;

<Input className={errors?.responsavel ? "border-destructive" : ""} />
{errors?.responsavel && <p>{errors.responsavel.message}</p>}
```

#### Passo 4: Usar `Controller` para Selects Shadcn

```typescript
// ❌ ANTES
<Select
  value={dados.unidadeGestoraId}
  onValueChange={(value) => onChange({ ...dados, unidadeGestoraId: value })}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
</Select>

// ✅ DEPOIS
import { Controller } from "react-hook-form";

<Controller
  name="requisitante.unidadeGestoraId"
  control={form.control}
  render={({ field }) => (
    <Select
      value={field.value}
      onValueChange={(value) => {
        field.onChange(value);
        // Também atualizar nome da unidade
        const unidade = uasgs.find(u => u.id === value);
        form.setValue("requisitante.unidadeGestoraNome", unidade?.nome || "");
      }}
    >
      <SelectTrigger className={`bg-white text-gray-900 ${errors?.unidadeGestoraId ? "border-destructive" : ""}`}>
        <SelectValue />
      </SelectTrigger>
    </Select>
  )}
/>
```

**⚠️ IMPORTANTE:** Shadcn Select **REQUER** Controller. Não funciona com `register()`.

#### Passo 5: Usar `register()` para Inputs

```typescript
// ❌ ANTES
<Input
  value={dados.responsavel}
  onChange={(e) => onChange({ ...dados, responsavel: e.target.value })}
/>

// ✅ DEPOIS
<Input
  {...form.register("requisitante.responsavel")}
  className={`bg-white text-gray-900 ${errors?.responsavel ? "border-destructive" : ""}`}
/>
```

#### Passo 6: Adicionar padrões visuais

**Todos os inputs e selects devem ter:**
```typescript
className="bg-white text-gray-900"
```

---

### 2. Migrando `ItemContratacao.tsx`

#### Passo 1: Atualizar Props e usar `form.watch()`

```typescript
// ❌ ANTES
export function ItemContratacao({ item, numero, onChange }: Props) {
  // Usa item diretamente
}

// ✅ DEPOIS
export function ItemContratacao({ form, index, numero, calcularValorTotal }: Props) {
  // Watch item atual
  const item = form.watch(`itens.${index}`);
  const errors = form.formState.errors.itens?.[index];
}
```

#### Passo 2: Substituir `onChange` manual por `register()`

```typescript
// ❌ ANTES
<Input
  value={item.descricao}
  onChange={(e) => onChange({ ...item, descricao: e.target.value })}
/>

// ✅ DEPOIS
<Input
  {...form.register(`itens.${index}.descricao`)}
  className={`bg-white text-gray-900 ${errors?.descricao ? "border-destructive" : ""}`}
/>
```

#### Passo 3: Usar `Controller` para Selects

```typescript
// ❌ ANTES
<Select
  value={item.tipo}
  onValueChange={(value) => onChange({ ...item, tipo: value })}
>

// ✅ DEPOIS
<Controller
  name={`itens.${index}.tipo`}
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger className={`bg-white text-gray-900 ${errors?.tipo ? "border-destructive" : ""}`}>
        <SelectValue />
      </SelectTrigger>
    </Select>
  )}
/>
```

#### Passo 4: Adicionar cálculo automático de valor total

```typescript
// ❌ ANTES
<Input
  type="number"
  value={item.quantidade}
  onChange={(e) => {
    const quantidade = Number(e.target.value);
    const valorTotal = quantidade * item.valorUnitario;
    onChange({ ...item, quantidade, valorTotal });
  }}
/>

// ✅ DEPOIS
<Input
  type="number"
  {...form.register(`itens.${index}.quantidade`, {
    valueAsNumber: true,
    onChange: () => calcularValorTotal(index), // Chamada automática
  })}
  className={`bg-white text-gray-900 ${errors?.quantidade ? "border-destructive" : ""}`}
/>
```

**⚠️ IMPORTANTE:** Use `valueAsNumber: true` para campos numéricos.

---

### 3. Migrando `FormularioPCA.tsx`

#### Passo 1: Atualizar destructuring do hook

```typescript
// ❌ ANTES
const {
  requisitante,
  itens,
  erros,
  enviando,
  enviado,
  resultadoEnvio,
  setRequisitante,
  adicionarItem,
  atualizarItem,
  removerItem,
  enviarFormulario,
  resetarFormulario,
} = useFormularioPCA();

// ✅ DEPOIS
const {
  form,
  itemsField,
  enviando,
  enviado,
  resultado,
  submitPCA,
  resetarFormulario,
  adicionarItem,
  removerItem,
  calcularValorTotal,
} = useFormularioPCA();
```

#### Passo 2: Watch valores para exibição

```typescript
// ✅ NOVO
const requisitante = form.watch("requisitante");
const itens = form.watch("itens");
```

#### Passo 3: Atualizar submissão do formulário

```typescript
// ❌ ANTES
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  await enviarFormulario();
}

<form onSubmit={handleSubmit}>

// ✅ DEPOIS
<form onSubmit={form.handleSubmit(submitPCA)}>
```

**⚠️ IMPORTANTE:** `form.handleSubmit()` já valida automaticamente antes de chamar `submitPCA`.

#### Passo 4: Atualizar renderização de itens

```typescript
// ❌ ANTES
{itens.map((item, index) => (
  <ItemContratacao
    key={item.id}
    item={item}
    numero={index + 1}
    onChange={(itemAtualizado) => atualizarItem(index, itemAtualizado)}
    onRemover={() => removerItem(index)}
    podeRemover={itens.length > 1}
  />
))}

// ✅ DEPOIS
{itemsField.fields.map((field, index) => (
  <ItemContratacao
    key={field.id}
    form={form}
    index={index}
    numero={index + 1}
    onRemover={() => removerItem(index)}
    podeRemover={itemsField.fields.length > 1}
    calcularValorTotal={calcularValorTotal}
  />
))}
```

**⚠️ IMPORTANTE:** Use `itemsField.fields` (do FieldArray) e não `itens` diretamente.

#### Passo 5: Atualizar props de `DadosRequisitante`

```typescript
// ❌ ANTES
<DadosRequisitante
  dados={requisitante}
  onChange={setRequisitante}
  erros={erros.requisitante}
/>

// ✅ DEPOIS
<DadosRequisitante form={form} />
```

#### Passo 6: Atualizar tela de sucesso

```typescript
// ❌ ANTES
if (enviado && resultadoEnvio) {
  return (
    <div>
      <p>{resultadoEnvio.mensagem}</p>
      <p>ID: {resultadoEnvio.dados?.pcaId}</p>
    </div>
  );
}

// ✅ DEPOIS
if (enviado && resultado) {
  return (
    <div>
      <p>{resultado.mensagem}</p>
      <p>ID: {resultado.dados?.pcaId}</p>
    </div>
  );
}
```

---

## 📐 Padrões e Convenções

### 1. Nomenclatura de campos no formulário

Sempre use dot notation para campos aninhados:

```typescript
// ✅ CORRETO
form.register("requisitante.responsavel")
form.register("itens.0.descricao")
form.watch("requisitante.unidadeGestoraId")
form.setValue("itens.2.valorTotal", 1000)

// ❌ ERRADO
form.register("responsavel") // Campo no nível root
form.register("itens[0].descricao") // Notação de array
```

### 2. Quando usar `Controller` vs `register()`

| Tipo de Input | Método | Motivo |
|--------------|--------|--------|
| Input nativo (`<input>`, `<textarea>`) | `register()` | Compatível com ref nativa |
| Select Shadcn | `Controller` | Componente controlado customizado |
| Checkbox Shadcn | `Controller` | Componente controlado customizado |
| DatePicker customizado | `Controller` | Componente controlado customizado |

### 3. Padrões de className

**Todos os inputs devem ter:**

```typescript
className={`bg-white text-gray-900 ${errors?.campo ? "border-destructive" : ""}`}
```

**Exemplo completo:**

```typescript
<Input
  {...form.register("requisitante.email")}
  type="email"
  placeholder="email@camocim.ce.gov.br"
  className={`bg-white text-gray-900 ${errors?.email ? "border-destructive" : ""}`}
/>
{errors?.email && (
  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
    <AlertCircle size={14} />
    {errors.email.message}
  </p>
)}
```

### 4. Campos numéricos

Sempre use `valueAsNumber: true`:

```typescript
<Input
  type="number"
  {...form.register("itens.0.quantidade", {
    valueAsNumber: true, // Converte string → number
    onChange: () => calcularValorTotal(0),
  })}
/>
```

### 5. Validação em tempo real

O hook já está configurado com `mode: "onChange"`:

```typescript
const form = useForm<FormularioPCAData>({
  resolver: zodResolver(FormularioPCASchema),
  mode: "onChange", // Valida a cada mudança
});
```

---

## 🐛 Troubleshooting

### Problema 1: "Cannot read property 'message' of undefined"

**Causa:** Tentar acessar erro antes de validar.

```typescript
// ❌ ERRADO
{errors.responsavel.message} // Pode ser undefined

// ✅ CORRETO
{errors?.responsavel && <p>{errors.responsavel.message}</p>}
```

---

### Problema 2: Select não atualiza valor

**Causa:** Esqueceu de usar `Controller`.

```typescript
// ❌ ERRADO
<Select {...form.register("tipo")}>

// ✅ CORRETO
<Controller
  name="tipo"
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
  )}
/>
```

---

### Problema 3: Campo numérico salva como string

**Causa:** Esqueceu `valueAsNumber: true`.

```typescript
// ❌ ERRADO
<Input type="number" {...form.register("quantidade")} />
// resultado: "10" (string)

// ✅ CORRETO
<Input
  type="number"
  {...form.register("quantidade", { valueAsNumber: true })}
/>
// resultado: 10 (number)
```

---

### Problema 4: Valor total não recalcula automaticamente

**Causa:** Esqueceu de passar `onChange` no register.

```typescript
// ❌ ERRADO
<Input {...form.register("quantidade", { valueAsNumber: true })} />

// ✅ CORRETO
<Input
  {...form.register("quantidade", {
    valueAsNumber: true,
    onChange: () => calcularValorTotal(index),
  })}
/>
```

---

### Problema 5: Erros de tipo TypeScript

**Causa:** Tentar acessar campo que não existe no schema.

```typescript
// ❌ ERRADO
form.register("campoInexistente") // TypeScript error

// ✅ CORRETO
// Sempre referencie campos definidos no FormularioPCASchema
form.register("requisitante.responsavel") // OK
form.register("itens.0.descricao") // OK
```

---

### Problema 6: "itens.map is not a function"

**Causa:** Tentar mapear `itemsField.fields` incorretamente.

```typescript
// ❌ ERRADO
{itens.map((item) => <ItemContratacao item={item} />)}

// ✅ CORRETO
{itemsField.fields.map((field, index) => (
  <ItemContratacao
    key={field.id}
    form={form}
    index={index}
  />
))}
```

---

## ✅ Testing

### Rodando os testes

```bash
# Rodar todos os testes
npm test

# Watch mode (rodar ao salvar)
npm run test:watch

# UI mode (interface gráfica)
npm run test:ui

# Coverage report
npm run test:coverage
```

### Estrutura dos testes

```
src/hooks/useFormularioPCA.test.ts
├── Validação Zod Schemas (11 tests)
│   ├── Formulário válido
│   ├── E-mail inválido
│   ├── Telefone inválido
│   ├── UUID inválido
│   ├── Descrição curta
│   ├── Quantidade zero
│   ├── Justificativa curta
│   ├── Data fora de 2025
│   ├── Tipo inválido
│   ├── Sem itens
│   └── Mais de 50 itens
│
├── Hook Functionality (6 tests)
│   ├── Inicializar com defaults
│   ├── Adicionar item
│   ├── Remover item
│   ├── Não remover último item
│   ├── Calcular valor total
│   └── Resetar formulário
│
├── submitPCA - Sucesso (1 test)
│   └── Enviar formulário com sucesso
│
└── submitPCA - Erros (2 tests)
    ├── Rejeitar se não autenticado
    └── Rollback se inserção falhar
```

### Escrevendo novos testes

**Exemplo de teste para validação:**

```typescript
it('deve rejeitar e-mail inválido', () => {
  const formData = createValidFormData();
  formData.requisitante.email = 'email-invalido';

  const result = FormularioPCASchema.safeParse(formData);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toContain('E-mail inválido');
  }
});
```

**Exemplo de teste para hook:**

```typescript
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
```

---

## 📚 Referências

### Documentação Oficial

- [react-hook-form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Arquivos relacionados

- `src/hooks/useFormularioPCA.ts` - Hook principal
- `src/hooks/useFormularioPCA.test.ts` - Testes unitários
- `src/components/formulario/DadosRequisitante.tsx` - Seção 1
- `src/components/formulario/ItemContratacao.tsx` - Itens repetíveis
- `src/components/formulario/FormularioPCA.tsx` - Orquestrador
- `supabase/migrations/20251209000000_add_pca_fields.sql` - Migration SQL

### Commits relevantes

- `refactor: adapt PCA form components to react-hook-form` (46f32d7)
- `test: add comprehensive unit tests for useFormularioPCA hook` (1da154f)
- `refactor: rewrite useFormularioPCA with react-hook-form + zod` (95f3b02)

---

## ✨ Conclusão

A migração para react-hook-form + Zod traz:

- ✅ **Melhor SoC:** Hook focado em lógica, componentes focados em UI
- ✅ **Type Safety:** Tipos inferidos do Zod eliminam erros
- ✅ **Validação robusta:** Schemas declarativos com refinements
- ✅ **Performance:** Re-renders otimizados
- ✅ **Testabilidade:** 20 testes unitários com 100% de sucesso
- ✅ **Manutenibilidade:** Código declarativo e legível

**A refatoração está completa e pronta para produção!** 🚀

---

**Desenvolvido por:** Claude Code AI Assistant
**Data:** 09/12/2024
**Branch:** `claude/code-analysis-roadmap-01Cgfhcj6yQMMixx5xdyGvJG`
