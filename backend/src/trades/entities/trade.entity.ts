export type Posisi = 'Buy' | 'Sell';
export type HasilTrade = 'Win' | 'Loss' | 'Break Even';

export class Trade {
  id: string;
  tanggal: string;
  pair: string;
  posisi: Posisi;
  lotSize: number;
  hasil: HasilTrade;
  profitLoss: number;
  catatan: string;
  sesuaiRencana: boolean;
  createdAt: string;
  updatedAt: string;
}
