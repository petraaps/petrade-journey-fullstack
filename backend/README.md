# PeTrade Journey API

Backend NestJS untuk Tugas 9 (NestJS Dasar + Struktur MVC). Resource utama: Trade. Data tersimpan dalam array di TradesService, sehingga hilang ketika proses backend dimulai ulang.

Dari folder backend:

```powershell
npm.cmd install
npm.cmd run start:dev
```

API berjalan di http://localhost:3001/trades. Frontend di http://localhost:5173 diizinkan melalui CORS.

```powershell
npm.cmd run build
npm.cmd run test:e2e -- --runInBand
```

GET /trades, GET /trades/:id, POST /trades, PATCH /trades/:id, dan DELETE /trades/:id tersedia. DELETE mengembalikan 204 tanpa body. ValidationPipe global menolak field asing dan input yang tidak valid. NotFoundException menangani ID tidak ditemukan; BadRequestException menangani hasil/P&L yang tidak konsisten dan PATCH kosong.

Panduan lengkap, pemetaan kriteria tugas, dan screenshot berada di [README utama](../README.md). Request untuk ekstensi REST Client tersedia di [docs/trades.http](../docs/trades.http).
