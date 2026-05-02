import { test, expect } from '@playwright/test';

test.describe('Flow CRUD', () => {
  let createdFlowUrl: string;

  test('lista de fluxos carrega', async ({ page }) => {
    await page.goto('/flow');
    await expect(page.getByPlaceholder('Pesquisar fluxos…')).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Novo fluxo' })).toBeVisible();
  });

  test('cria um novo fluxo', async ({ page }) => {
    await page.goto('/flow');

    await page.getByRole('button', { name: '+ Novo fluxo' }).click();
    await expect(page.getByLabel('Nome do Fluxo')).toBeVisible();

    await page.getByLabel('Nome do Fluxo').fill('Fluxo E2E Teste');
    await page.getByLabel('Descrição').fill('Descrição criada por teste automatizado');
    await page.getByRole('button', { name: 'Criar' }).click();

    // After creation, should redirect to /flow/:id
    await page.waitForURL(/\/flow\/.+/);
    createdFlowUrl = page.url();
    await expect(page.getByRole('heading', { name: 'Editar fluxo' })).toBeVisible();
    await expect(page.getByLabel('Nome do Fluxo')).toHaveValue('Fluxo E2E Teste');
  });

  test('edita nome e descrição do fluxo', async ({ page }) => {
    await page.goto(createdFlowUrl || '/flow');
    if (!createdFlowUrl) test.skip();

    const nameInput = page.getByLabel('Nome do Fluxo');
    await nameInput.fill('Fluxo E2E Atualizado');
    await page.getByLabel('Descrição').fill('Descrição atualizada');
    await page.getByRole('button', { name: 'Salvar' }).first().click();

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByLabel('Nome do Fluxo')).toHaveValue('Fluxo E2E Atualizado');
  });

  test('adiciona passo ao fluxo', async ({ page }) => {
    await page.goto(createdFlowUrl || '/flow');
    if (!createdFlowUrl) test.skip();

    await page.getByPlaceholder('Novo passo').fill('Passo 1 — E2E');
    await page.getByRole('button', { name: '+ Adicionar passo' }).click();

    await expect(page.locator('input[value="Passo 1 — E2E"]')).toBeVisible();
  });

  test('renomeia passo do fluxo', async ({ page }) => {
    await page.goto(createdFlowUrl || '/flow');
    if (!createdFlowUrl) test.skip();

    const stepInput = page.locator('input[value="Passo 1 — E2E"]');
    await stepInput.fill('Passo 1 — Renomeado');
    await page.getByRole('button', { name: 'Salvar' }).last().click();

    await page.reload();
    await expect(page.locator('input[value="Passo 1 — Renomeado"]')).toBeVisible();
  });

  test('remove passo do fluxo', async ({ page }) => {
    await page.goto(createdFlowUrl || '/flow');
    if (!createdFlowUrl) test.skip();

    await page.getByRole('button', { name: 'Remover passo' }).click();
    await expect(page.getByText('Remover este passo?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await page.reload();
    await expect(page.locator('input[value="Passo 1 — Renomeado"]')).not.toBeVisible();
  });

  test('fluxo aparece na listagem após criação', async ({ page }) => {
    await page.goto('/flow');
    await expect(page.getByText('Fluxo E2E Atualizado')).toBeVisible();
  });

  test('pesquisa filtra fluxos', async ({ page }) => {
    await page.goto('/flow');
    await page.getByPlaceholder('Pesquisar fluxos…').fill('E2E Atualizado');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Fluxo E2E Atualizado')).toBeVisible();
  });

  test('pesquisa sem resultados mostra mensagem', async ({ page }) => {
    await page.goto('/flow');
    await page.getByPlaceholder('Pesquisar fluxos…').fill('xyzzy-nao-existe-999');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Nenhum fluxo encontrado.')).toBeVisible();
  });

  test('exclui fluxo da listagem', async ({ page }) => {
    await page.goto('/flow');
    const row = page.locator('li').filter({ hasText: 'Fluxo E2E Atualizado' });
    await row.getByRole('button', { name: 'excluir' }).click();

    await expect(page.getByText('Excluir este fluxo?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    await page.reload();
    await expect(page.getByText('Fluxo E2E Atualizado')).not.toBeVisible();
  });
});
