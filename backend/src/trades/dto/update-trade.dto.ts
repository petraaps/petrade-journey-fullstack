import { PartialType } from '@nestjs/mapped-types';
import { CreateTradeDto } from './create-trade.dto';

// PATCH boleh berisi sebagian field; null tidak boleh menggantikan field wajib.
export class UpdateTradeDto extends PartialType(CreateTradeDto, {
  skipNullProperties: false,
}) {}
