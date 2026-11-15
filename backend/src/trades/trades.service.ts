import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { Trade } from './entities/trade.entity';

@Injectable()
export class TradesService {
  // Sesuai Modul 9: data sementara, kembali kosong ketika backend restart.
  private trades: Trade[] = [];

  create(dto: CreateTradeDto): Trade {
    const now = new Date().toISOString();
    const trade: Trade = {
      ...dto,
      id: randomUUID(),
      catatan: dto.catatan?.trim() ?? '',
      sesuaiRencana: dto.sesuaiRencana ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.validateResult(trade);
    this.trades.push(trade);
    return trade;
  }

  findAll(): Trade[] {
    return [...this.trades].sort((a, b) =>
      b.tanggal.localeCompare(a.tanggal) || b.createdAt.localeCompare(a.createdAt),
    );
  }

  findOne(id: string): Trade {
    const trade = this.trades.find((item) => item.id === id);
    if (!trade) {
      throw new NotFoundException(`Trade dengan id ${id} tidak ditemukan.`);
    }
    return trade;
  }

  update(id: string, dto: UpdateTradeDto): Trade {
    const current = this.findOne(id);
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Kirim minimal satu field untuk mengubah trade.');
    }
    const updated: Trade = {
      ...current,
      ...dto,
      catatan: dto.catatan === undefined ? current.catatan : dto.catatan?.trim() ?? '',
      updatedAt: new Date().toISOString(),
    };
    // Validasi hasil gabungan sebelum mengubah array agar PATCH yang gagal bersifat atomik.
    this.validateResult(updated);
    this.trades = this.trades.map((trade) => trade.id === id ? updated : trade);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.trades = this.trades.filter((trade) => trade.id !== id);
  }

  private validateResult(trade: Trade): void {
    const valid =
      (trade.hasil === 'Win' && trade.profitLoss > 0) ||
      (trade.hasil === 'Loss' && trade.profitLoss < 0) ||
      (trade.hasil === 'Break Even' && trade.profitLoss === 0);
    if (!valid) {
      throw new BadRequestException(
        'Win harus memiliki profit positif, Loss negatif, dan Break Even bernilai 0.',
      );
    }
  }
}
