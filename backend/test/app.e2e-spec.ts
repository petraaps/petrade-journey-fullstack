import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Trades API: HTTP, DI, ValidationPipe, dan aturan bisnis', () => {
  let app: INestApplication;
  const valid = {
    tanggal: '2026-11-15', pair: ' xauusd ', posisi: 'Buy',
    lotSize: 0.1, hasil: 'Win', profitLoss: 150,
    catatan: 'Mengikuti rencana', sesuaiRencana: true,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterEach(async () => { await app.close(); });

  it('menjalankan alur GET -> POST -> GET detail -> PATCH -> DELETE -> 404', async () => {
    const server = app.getHttpServer();
    await request(server).get('/trades').expect(200).expect([]);
    const created = await request(server).post('/trades').send(valid).expect(201);
    const trade = created.body as { id: string; pair: string };
    expect(trade.pair).toBe('XAUUSD');
    expect(trade.id).toEqual(expect.any(String));
    await request(server).get('/trades/' + trade.id).expect(200)
      .expect((response) => { expect(response.body).toMatchObject(trade); });
    await request(server).patch('/trades/' + trade.id)
      .send({ hasil: 'Loss', profitLoss: -50, sesuaiRencana: false }).expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({ hasil: 'Loss', profitLoss: -50, sesuaiRencana: false });
      });
    await request(server).get('/trades').expect(200)
      .expect((response) => { expect(response.body).toHaveLength(1); });
    const removed = await request(server).delete('/trades/' + trade.id).expect(204);
    expect(removed.text).toBe('');
    await request(server).get('/trades/' + trade.id).expect(404);
    await request(server).get('/trades').expect(200).expect([]);
  });

  it.each([
    { pair: '!' }, { tanggal: '2026-02-30' }, { tanggal: '2026-11-15T00:00:00Z' },
    { lotSize: 0 }, { lotSize: '0.1' }, { lotSize: 0.123 },
    { posisi: 'Hold' }, { hasil: 'Unknown' }, { profitLoss: '150' },
    { sesuaiRencana: 'true' }, { sesuaiRencana: null }, { id: 'milik-client' },
  ])('menolak input tidak valid: %j', async (invalid) => {
    await request(app.getHttpServer()).post('/trades').send({ ...valid, ...invalid })
      .expect(400).expect((response) => { expect(response.body.message).toBeDefined(); });
    await request(app.getHttpServer()).get('/trades').expect(200).expect([]);
  });

  it('mewajibkan field create dan memberi default untuk field opsional', async () => {
    await request(app.getHttpServer()).post('/trades').send({}).expect(400);
    const { catatan: _catatan, sesuaiRencana: _sesuaiRencana, ...required } = valid;
    await request(app.getHttpServer()).post('/trades').send(required).expect(201)
      .expect((response) => {
        expect(response.body).toMatchObject({ catatan: '', sesuaiRencana: false });
      });
  });

  it('menolak hasil/P&L tidak konsisten pada create dan partial update tanpa merusak data', async () => {
    const server = app.getHttpServer();
    await request(server).post('/trades').send({ ...valid, profitLoss: -10 }).expect(400);
    const { body } = await request(server).post('/trades').send(valid).expect(201);
    const id = (body as { id: string }).id;
    await request(server).patch('/trades/' + id).send({ hasil: 'Loss' }).expect(400);
    await request(server).patch('/trades/' + id).send({}).expect(400);
    await request(server).patch('/trades/' + id).send({ lotSize: null }).expect(400);
    await request(server).get('/trades/' + id).expect(200)
      .expect((response) => { expect(response.body).toMatchObject({ hasil: 'Win', profitLoss: 150 }); });
    await request(server).patch('/trades/' + id)
      .send({ hasil: 'Break Even', profitLoss: 0 }).expect(200);
  });

  it('mengembalikan 404 untuk GET, PATCH, dan DELETE id yang tidak ada', async () => {
    const server = app.getHttpServer();
    await request(server).get('/trades/tidak-ada').expect(404);
    await request(server).patch('/trades/tidak-ada').send({ catatan: 'uji' }).expect(404);
    await request(server).delete('/trades/tidak-ada').expect(404);
  });

  it('mengizinkan preflight CORS frontend', async () => {
    await request(app.getHttpServer()).options('/trades')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'PATCH')
      .expect(204).expect('Access-Control-Allow-Origin', 'http://localhost:5173');
  });
});
