import { useState } from 'react';
import TradeCard from './TradeCard.jsx';

function TradeList({ trades, loading, disabled, activeId, onUbahTrade, onHapusTrade }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  async function konfirmasiHapus(id) {
    await onHapusTrade(id);
    setPendingDeleteId(null);
  }

  return (
    <section className="trade-list-section" id="riwayat" aria-busy={loading}>
      <h2>Riwayat Trading</h2>
      {loading ? <p>Menunggu data trading...</p> : trades.length === 0 ? (
        <div className="empty-state"><p>Belum ada data Trade</p></div>
      ) : (
        <div className="trade-table-wrapper">
          <table className="trade-table">
            <caption className="sr-only">Riwayat trading dan tindakan ubah atau hapus</caption>
            <thead>
              <tr>
                <th scope="col">Tanggal</th><th scope="col">Pair</th>
                <th scope="col">Posisi</th><th scope="col">Lot Size</th>
                <th scope="col">Hasil</th><th scope="col">Profit/Loss</th>
                <th scope="col">Sesuai Rencana</th><th scope="col">Catatan</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <TradeCard key={trade.id} trade={trade} disabled={disabled}
                  active={activeId === trade.id}
                  confirmDelete={pendingDeleteId === trade.id}
                  onUbah={() => onUbahTrade(trade.id)}
                  onMintaHapus={() => setPendingDeleteId(trade.id)}
                  onBatalHapus={() => setPendingDeleteId(null)}
                  onHapus={() => konfirmasiHapus(trade.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TradeList;
