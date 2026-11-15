function TradeCard({
  trade, disabled, active, confirmDelete, onUbah, onMintaHapus, onBatalHapus, onHapus,
}) {
  return (
    <tr>
      <td>{trade.tanggal}</td>
      <td>{trade.pair}</td>
      <td>{trade.posisi}</td>
      <td>{trade.lotSize.toFixed(2)}</td>
      <td>
        <span className={trade.hasil === 'Win' ? 'status-win' : trade.hasil === 'Loss' ? 'status-loss' : 'status-neutral'}>
          {trade.hasil}
        </span>
      </td>
      <td className={trade.profitLoss >= 0 ? 'text-success' : 'text-danger'}>
        ${trade.profitLoss.toFixed(2)}
      </td>
      <td>{trade.sesuaiRencana ? 'Ya' : 'Tidak'}</td>
      <td className="trade-notes">{trade.catatan || '-'}</td>
      <td>
        <div className="trade-actions">
          {confirmDelete ? (
            <>
              <span>Hapus trade ini?</span>
              <button type="button" className="btn-danger" onClick={onHapus} disabled={disabled}>
                {active ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button type="button" className="btn-secondary" onClick={onBatalHapus} disabled={disabled}>Batal</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-secondary" onClick={onUbah} disabled={disabled}
                aria-label={`Ubah trade ${trade.pair} ${trade.tanggal}`}>Ubah</button>
              <button type="button" className="btn-danger" onClick={onMintaHapus} disabled={disabled}
                aria-label={`Hapus trade ${trade.pair} ${trade.tanggal}`}>Hapus</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default TradeCard;
