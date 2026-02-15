import { test, expect } from '@playwright/test';

test.describe('Autenticação e Proteção de Rotas', () => {

    test('Deve redirecionar para login ao acessar rota protegida', async ({ page }) => {
        // Tentar acessar a home ("/") que é protegida
        await page.goto('/');

        // Deve ser redirecionado para /login
        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.getByRole('heading', { name: "Login" })).toBeVisible();
    });

    test('Deve validar credenciais incorretas', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Email').fill('usuario_inexistente@teste.com');
        await page.getByLabel('Senha').fill('senhaerrada123');
        await page.getByRole('button', { name: 'Entrar' }).click();

        // Deve exibir qualquer mensagem de erro (alert)
        await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    });

    // Nota: Como não temos um usuário real garantido no banco de teste, 
    // este teste positivo pode falhar se não houver seed.
    // O ideal seria criar um usuário de teste antes via API do Supabase, 
    // mas vamos tentar rodar primeiro os testes de proteção e erro.

    /* 
    test('Deve fazer login com sucesso', async ({ page }) => {
        await page.goto('/login');
        // Usar credenciais de um usuário de teste (se houver)
        // ...
    });
    */
});
