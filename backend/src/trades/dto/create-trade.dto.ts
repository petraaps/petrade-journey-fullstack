import { Transform } from 'class-transformer';
import {
  IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString,
  Matches, MaxLength, Min, MinLength, ValidateIf,
} from 'class-validator';
import type { HasilTrade, Posisi } from '../entities/trade.entity';

export class CreateTradeDto {
  @IsDateString({ strict: true }, { message: 'Tanggal trading harus valid.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Gunakan format tanggal YYYY-MM-DD.' })
  tanggal: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/, { message: 'Pair hanya boleh berisi huruf dan angka.' })
  pair: string;

  @IsIn(['Buy', 'Sell'], { message: 'Posisi harus Buy atau Sell.' })
  posisi: Posisi;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Lot size harus angka dengan maksimal 2 desimal.' })
  @Min(0.01, { message: 'Lot size minimal 0.01.' })
  lotSize: number;

  @IsIn(['Win', 'Loss', 'Break Even'])
  hasil: HasilTrade;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Profit/loss harus angka dengan maksimal 2 desimal.' })
  profitLoss: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  catatan?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  sesuaiRencana?: boolean;
}
