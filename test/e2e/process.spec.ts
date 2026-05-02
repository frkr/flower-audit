import { test, expect } from '@playwright/test';

test.describe('Process CRUD', () => {
  let createdProcessUrl: string;

  test('lista de processos carrega', async ({ page }) => {
    await page.goto('/process');
    await expect(page.getByPlaceholder('Pesquisar processos…')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Novo processo' })).toBeVisible();
  });

  test('cria um novo processo', async ({ page }) => {
    await page.goto('/process');

    await page.getByRole('button', { name: '+ Novo processo' }).click();
    await expect(page.getByLabel('Nome do processo')).toBeVisible();

    await page.getByLabel('Nome do processo').fill('Processo E2E Teste');
    await page.getByLabel('Descrição').fill('Processo criado por teste automatizado');
    await page.getByRole('button', { name: 'Criar' }).click();

    // Should stay on /process (no redirect on create for processes)
    await page.waitForResponse((r) => r.url().includes('/process') && r.status() === 200);
    await page.reload();
    await expect(page.getByText('Processo E2E Teste')).toBeVisible();
  });

  test('processo aparece na listagem após criação', async ({ page }) => {
    await page.goto('/process');
    await expect(page.getByText('Processo E2E Teste')).toBeVisible();
  });

  test('abre processo para edição', async ({ page }) => {
    await page.goto('/process');
    await page.getByRole('link', { name: 'Processo E2E Teste' }).click();
    await page.waitForURL(/\/process\/.+/);
    createdProcessUrl = page.url();
    await expect(page.getByText('Processo E2E Teste')).toBeVisible();
  });

  test('edita metadados do processo', async ({ page }) => {
    await page.goto(createdProcessUrl || '/process');
    if (!createdProcessUrl) test.skip();

    await page.getByRole('button', { name: 'Editar dados' }).click();
    const nameInput = page.getByRole('textbox').first();
    await nameInput.fill('Processo E2E Atualizado');
    await page.getByRole('button', { name: 'Salvar dados do processo' }).click();

    await page.reload();
    await expect(page.getByText('Processo E2E Atualizado')).toBeVisible();
  });

  test('pesquisa filtra processos', async ({ page }) => {
    await page.goto('/process');
    await page.getByPlaceholder('Pesquisar processos…').fill('E2E Atualizado');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Processo E2E Atualizado')).toBeVisible();
  });

  test('pesquisa sem resultados mostra mensagem', async ({ page }) => {
    await page.goto('/process');
    await page.getByPlaceholder('Pesquisar processos…').fill('xyzzy-nao-existe-999');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Nenhum processo encontrado.')).toBeVisible();
  });

  test('exclui processo da página de detalhe', async ({ page }) => {
    await page.goto(createdProcessUrl || '/process');
    if (!createdProcessUrl) test.skip();

    await page.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Excluir este processo?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await page.waitForURL('/process');
    await expect(page.getByText('Processo E2E Atualizado')).not.toBeVisible();
  });

  test('exclui processo diretamente da listagem', async ({ page }) => {
    // Create a fresh process to delete from the list
    await page.goto('/process');
    await page.getByRole('button', { name: '+ Novo processo' }).click();
    await page.getByLabel('Nome do processo').fill('Processo Para Excluir');
    await page.getByRole('button', { name: 'Criar' }).click();
    await page.waitForResponse((r) => r.url().includes('/process') && r.status() === 200);
    await page.reload();

    const row = page.locator('li').filter({ hasText: 'Processo Para Excluir' });
    await row.getByRole('button', { name: 'excluir' }).click();

    await expect(page.getByText('Excluir este processo?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await page.reload();
    await expect(page.getByText('Processo Para Excluir')).not.toBeVisible();
  });
});
