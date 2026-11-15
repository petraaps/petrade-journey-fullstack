import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post,
} from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body() dto: CreateTradeDto) {
    return this.tradesService.create(dto);
  }

  @Get()
  findAll() {
    return this.tradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTradeDto) {
    return this.tradesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tradesService.remove(id);
  }
}
