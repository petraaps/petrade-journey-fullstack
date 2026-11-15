import { useState } from 'react';

function buatForm(trade) {
  return {
    tanggal: trade?.tanggal ?? '',
    pair: trade?.pair ?? '',
    posisi: trade?.posisi ?? 'Buy',
    lotSize: trade?.lotSize ?? '',
    hasil: trade?.hasil ?? 'Win',
    profitLoss: trade?.profitLoss ?? '',
    catatan: trade?.catatan ?? '',
    sesuaiRencana: trade?.sesuaiRencana ?? false,
  };
}

function TradeForm({ trade, onSimpanTrade, onBatal, disabled, saving }) {
  const [form, setForm] = useState(() => buatForm(trade));
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;
    setError('');
    const pair = form.pair.trim().toUpperCase();
    const lotSize = Number(form.lotSize);
    const profitLoss = Number(form.profitLoss);
    if (!/^[A-Z0-9]{3,20}$/.test(pair)) {
      setError('Pair harus terdiri dari 3-20 huruf atau angka.');
      return;
    }
    if (!Number.isFinite(lotSize) || lotSize < 0.01 || !Number.isFinite(profitLoss)) {
      setError('Lot size dan profit/loss harus berupa angka yang valid.');
      return;
    }
    if (
      (form.hasil === 'Win' && profitLoss <= 0) ||
      (form.hasil === 'Loss' && profitLoss >= 0) ||
      (form.hasil === 'Break Even' && profitLoss !== 0)
    ) {
      setError('Win harus memiliki profit positif, Loss negatif, dan Break Even bernilai 0.');
      return;
    }
    try {
      await onSimpanTrade({ ...form, pair, lotSize, profitLoss });
      setForm(buatForm());
    } catch (err) {
      // Pertahankan input agar pengguna dapat memperbaiki atau mencoba lagi.
      setError(err.message);
    }
  }

  return (
    <section className="trade-form-section" id="tambah-trade">
      <h2>{trade ? 'Ubah Trade' : 'Tambah Trade Baru'}</h2>
      <form className="trade-form" onSubmit={handleSubmit} aria-busy={saving}>
        <fieldset disabled={disabled}>
          <label>
            Tanggal Trading
            <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required />
          </label>
          <label>
            Pair Trading
            <input type="text" name="pair" placeholder="Contoh: XAUUSD" minLength={3}
              maxLength={20} value={form.pair} onChange={handleChange} required />
          </label>
          <label>
            Posisi
            <select name="posisi" value={form.posisi} onChange={handleChange}>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </label>
          <label>
            Lot Size
            <input type="number" name="lotSize" step="0.01" min="0.01"
              value={form.lotSize} onChange={handleChange} required />
          </label>
          <label>
            Hasil Trade
            <select name="hasil" value={form.hasil} onChange={handleChange}>
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="Break Even">Break Even</option>
            </select>
          </label>
          <label>
            Profit / Loss ($)
            <input type="number" name="profitLoss" step="0.01" placeholder="Contoh: 150 atau -50"
              value={form.profitLoss} onChange={handleChange} required />
          </label>
          <label className="full-width">
            Catatan Trading
            <textarea name="catatan" rows={3} maxLength={2000}
              placeholder="Alasan entry dan evaluasi trade (opsional)"
              value={form.catatan} onChange={handleChange} />
          </label>
          <label className="checkbox-label full-width">
            <input type="checkbox" name="sesuaiRencana"
              checked={form.sesuaiRencana} onChange={handleChange} />
            Trade sesuai rencana
          </label>
          {error && <p className="feedback feedback-error full-width" role="alert">{error}</p>}
          <button type="submit" className="btn-tambah">
            {saving ? 'Menyimpan...' : trade ? 'Simpan Perubahan' : '+ Tambah Trade'}
          </button>
          {trade && <button type="button" className="btn-secondary full-width" onClick={onBatal}>Batal Ubah</button>}
        </fieldset>
      </form>
    </section>
  );
}

export default TradeForm;
