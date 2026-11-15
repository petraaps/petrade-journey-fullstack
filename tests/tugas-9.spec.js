import { expect, test } from '@playwright/test';
import path from 'node:path';

const screenshotDir = path.resolve('docs/screenshots/tugas-9');
async function screenshot(page, name, locator) {
  await page.evaluate(() => document.fonts.ready);
  const options = { path: path.join(screenshotDir, name + '.png'), animations: 'disabled' };
  if (locator) await locator.screenshot(options);
  else await page.screenshot({ ...options, fullPage: true });
}

test.describe.serial('Bukti Tugas 9: backend terlebih dahulu, lalu frontend', () => {
  test('kode sumber dan seluruh method REST menghasilkan response nyata', async ({ page }) => {
    await page.goto('/docs/tugas-9-client.html');
    await page.getByRole('button', { name: 'Kode sumber' }).click();
    for (const [value, name] of [
      ['setup', '01-bootstrap-cors-validation-pipe'],
      ['entity', '02-resource-entity-trade'],
      ['service', '03-service-crud-exception'],
      ['controller', '04-controller-dependency-injection'],
      ['dto', '05-dto-create-update'],
    ]) {
      await page.locator('#source').selectOption(value);
      await expect(page.locator('#source-code')).not.toBeEmpty();
      await screenshot(page, name);
    }
    await page.getByRole('button', { name: 'Request HTTP' }).click();
    for (const [scenario, status, name] of [
      ['list', 200, '06-get-list-kosong'],
      ['create', 201, '07-post-tambah-trade'],
      ['list', 200, '08-get-list-trade'],
      ['detail', 200, '09-get-detail-trade'],
      ['update', 200, '10-patch-ubah-trade'],
      ['validation', 400, '11-error-validasi-dto'],
      ['business', 400, '12-error-aturan-hasil-profit'],
      ['notfound', 404, '13-error-trade-tidak-ditemukan'],
      ['delete', 204, '14-delete-trade'],
      ['list', 200, '15-get-setelah-hapus'],
    ]) {
      await page.locator('#scenario').selectOption(scenario);
      const responsePromise = page.waitForResponse((response) =>
        response.url().startsWith('http://127.0.0.1:3002/trades') &&
        response.request().method() !== 'OPTIONS');
      await page.getByRole('button', { name: 'Kirim Request' }).click();
      const response = await responsePromise;
      expect(response.status()).toBe(status);
      await expect(page.locator('#status')).toContainText(String(status));
      await screenshot(page, name);
    }
  });

  test('tambah, reload, ubah, batal hapus, hapus, dan ringkasan React', async ({ page }) => {
    // Fokus pengujian ini adalah API lokal; layanan market eksternal dibuat gagal secara terkontrol.
    await page.route('https://biquote.io/**', (route) => route.abort());
    const crashes = [];
    page.on('pageerror', (error) => crashes.push(error.message));
    await page.goto('/');
    await expect(page.getByText('Belum ada data Trade', { exact: true })).toBeVisible();
    await screenshot(page, '16-dashboard-awal');

    const form = page.locator('#tambah-trade');
    await form.getByRole('button', { name: '+ Tambah Trade', exact: true }).click();
    await expect(form.locator('input[name="tanggal"]:invalid')).toHaveCount(1);
    await screenshot(page, '17-form-wajib-diisi', form);

    await form.getByLabel('Tanggal Trading').fill('2026-11-15');
    await form.getByLabel('Pair Trading').fill(' xauusd ');
    await form.getByLabel('Lot Size').fill('0.10');
    await form.getByLabel('Profit / Loss ($)', { exact: true }).fill('-50');
    await form.getByRole('button', { name: '+ Tambah Trade', exact: true }).click();
    await expect(form.getByRole('alert')).toContainText('Win harus memiliki profit positif');
    await screenshot(page, '18-form-validasi-hasil-profit', form);

    await form.getByLabel('Profit / Loss ($)', { exact: true }).fill('150');
    await form.getByLabel('Catatan Trading').fill('Entry mengikuti rencana trading.');
    await form.getByLabel('Trade sesuai rencana').check();
    await screenshot(page, '19-form-tambah-trade', form);
    await form.getByRole('button', { name: '+ Tambah Trade', exact: true }).click();
    await expect(page.getByText('Trade berhasil ditambahkan.', { exact: true })).toBeVisible();
    await expect(page.locator('#riwayat tbody tr')).toHaveCount(1);
    await expect(page.locator('#riwayat')).toContainText('XAUUSD');
    await expect(page.locator('.account-summary')).toContainText('$5,150.00');
    await screenshot(page, '20-trade-berhasil-ditambah');
    await page.reload();
    await expect(page.locator('#riwayat tbody tr')).toHaveCount(1);
    await expect(page.locator('#riwayat')).toContainText('Entry mengikuti rencana trading.');
    await screenshot(page, '21-data-tetap-ada-setelah-reload', page.locator('#riwayat'));

    await page.getByRole('button', { name: 'Ubah trade XAUUSD 2026-11-15', exact: true }).click();
    await expect(form.getByRole('heading', { name: 'Ubah Trade', exact: true })).toBeVisible();
    await form.getByLabel('Hasil Trade').selectOption('Loss');
    await form.getByLabel('Profit / Loss ($)', { exact: true }).fill('-50');
    await form.getByLabel('Catatan Trading').fill('Evaluasi: stop loss tersentuh.');
    await form.getByLabel('Trade sesuai rencana').uncheck();
    await screenshot(page, '22-form-ubah-trade', form);
    await form.getByRole('button', { name: 'Simpan Perubahan', exact: true }).click();
    await expect(page.getByText('Trade berhasil diubah.', { exact: true })).toBeVisible();
    await expect(page.locator('#riwayat')).toContainText('$-50.00');
    await expect(page.locator('.account-summary')).toContainText('$4,950.00');
    await screenshot(page, '23-trade-berhasil-diubah');

    const removeButton = page.getByRole('button', { name: 'Hapus trade XAUUSD 2026-11-15', exact: true });
    await removeButton.click();
    await expect(page.getByText('Hapus trade ini?', { exact: true })).toBeVisible();
    await screenshot(page, '24-konfirmasi-hapus', page.locator('#riwayat'));
    await page.getByRole('button', { name: 'Batal', exact: true }).click();
    await expect(page.locator('#riwayat tbody tr')).toHaveCount(1);
    await removeButton.click();
    await page.getByRole('button', { name: 'Ya, Hapus', exact: true }).click();
    await expect(page.getByText('Trade berhasil dihapus.', { exact: true })).toBeVisible();
    await expect(page.getByText('Belum ada data Trade', { exact: true })).toBeVisible();
    await expect(page.locator('.account-summary')).toContainText('$5,000.00');
    await screenshot(page, '25-trade-berhasil-dihapus');
    expect(crashes).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot(page, '26-tampilan-mobile');
    const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, screen: window.innerWidth }));
    expect(width.page).toBeLessThanOrEqual(width.screen);
  });

  test('kegagalan backend mempertahankan input, lalu dapat dicoba ulang', async ({ page }) => {
    await page.route('https://biquote.io/**', (route) => route.abort());
    await page.goto('/');
    await expect(page.getByText('Belum ada data Trade', { exact: true })).toBeVisible();
    const form = page.locator('#tambah-trade');
    await form.getByLabel('Tanggal Trading').fill('2026-11-15');
    await form.getByLabel('Pair Trading').fill('EURUSD');
    await form.getByLabel('Lot Size').fill('0.10');
    await form.getByLabel('Profit / Loss ($)', { exact: true }).fill('25');
    await page.route('**/trades', (route) => route.request().method() === 'POST' ? route.abort() : route.continue());
    await form.getByRole('button', { name: '+ Tambah Trade', exact: true }).click();
    await expect(form.getByRole('alert')).toContainText('Tidak dapat menghubungi backend');
    await expect(form.getByLabel('Pair Trading')).toHaveValue('EURUSD');
    await screenshot(page, '27-gagal-simpan-input-tetap-ada', form);
    await page.unroute('**/trades');
    await form.getByRole('button', { name: '+ Tambah Trade', exact: true }).click();
    await expect(page.getByText('Trade berhasil ditambahkan.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Hapus trade EURUSD 2026-11-15', exact: true }).click();
    await page.getByRole('button', { name: 'Ya, Hapus', exact: true }).click();
    await expect(page.getByText('Belum ada data Trade', { exact: true })).toBeVisible();

    await page.route('**/trades', (route) => route.abort());
    await page.reload();
    await expect(page.locator('main > .feedback-error')).toContainText('Tidak dapat menghubungi backend');
    await screenshot(page, '28-gagal-memuat-dan-coba-lagi');
    await page.unroute('**/trades');
    await page.getByRole('button', { name: 'Muat ulang data', exact: true }).click();
    await expect(page.locator('main > .feedback-error')).toHaveCount(0);
    await expect(page.getByText('Belum ada data Trade', { exact: true })).toBeVisible();
  });
});
