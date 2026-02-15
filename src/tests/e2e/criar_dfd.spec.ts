import { test, expect } from '@playwright/test';

test.describe('Fluxo: Criar DFD', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Deve exibir erro ao tentar criar DFD sem autenticação', async ({ page }) => {
        // 1. Navegar para a lista de DFDs
        // Nota: O menu pode estar colapsado em mobile, mas no desktop deve estar visível
        const linkDfds = page.getByRole('link', { name: /DFDs/i });
        if (await linkDfds.isVisible()) {
            await linkDfds.click();
        } else {
            await page.goto('/dfds');
        }

        // 2. Clicar em Novo DFD
        await expect(page).toHaveURL(/.*\/dfds/);
        await page.getByRole('button', { name: "Novo DFD" }).click();

        // 3. Verificar redirecionamento
        await expect(page).toHaveURL(/.*\/dfds\/novo/);

        // 4. Preencher formulário básico
        // Aguarda carregar Uasgs (pode demorar)
        // await page.waitForTimeout(1000); 

        await page.getByPlaceholder('Descreva brevemente o objeto da contratação...').fill('Teste Automatizado Playwright');
        await page.getByPlaceholder('Descreva a justificativa da necessidade...').fill('Teste de criação de DFD via E2E');

        // Selecionar Unidade Gestora (se houver dados mockados ou reais)
        // await page.getByRole('combobox', { name: /Selecione a UNIDADE GESTORA/i }).click();
        // await page.getByRole('option').first().click();

        // 5. Tentar Salvar
        await page.getByRole('button', { name: "Salvar DFD" }).click();

        // 6. Verificar Toast de Erro (já que não estamos logados)
        // O toast geralmente aparece como um listitem ou alert
        const toast = page.locator('li[role="status"]'); // Sonner uses ol > li
        // Ou pelo texto
        await expect(page.getByText("Você precisa estar autenticado")).toBeVisible({ timeout: 5000 });
    });

    // TODO: Habilitar este teste quando houver uma página de Login
    /*
    test('Deve criar DFD com sucesso (Autenticado)', async ({ page }) => {
      // 1. Login
      await page.goto('/login');
      await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL || 'teste@example.com');
      await page.getByLabel('Senha').fill(process.env.E2E_USER_PASSWORD || '123456');
      await page.getByRole('button', { name: 'Entrar' }).click();
      
      // 2. Navegar e Criar
      await page.goto('/novo-dfd');
      // ... preencher campos ...
      await page.getByRole('button', { name: "Salvar DFD" }).click();
      
      // 3. Validar Sucesso
      await expect(page.getByText("DFD criado com sucesso")).toBeVisible();
    });
    */
});
