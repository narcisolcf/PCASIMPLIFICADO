# Configuração Manual de RLS para agentes_publicos

A tabela `agentes_publicos` precisa de políticas RLS. Execute estes comandos no painel do Lovable Cloud:

## Como adicionar:
1. Acesse Settings → Cloud → Database
2. Execute cada comando SQL abaixo:

```sql
CREATE POLICY "agentes_select" ON agentes_publicos 
FOR SELECT USING (true);

CREATE POLICY "agentes_insert" ON agentes_publicos 
FOR INSERT WITH CHECK (true);

CREATE POLICY "agentes_update" ON agentes_publicos 
FOR UPDATE USING (true);

CREATE POLICY "agentes_delete" ON agentes_publicos 
FOR DELETE USING (true);
```

Isso permitirá que usuários autenticados possam criar, visualizar, editar e excluir agentes públicos.
