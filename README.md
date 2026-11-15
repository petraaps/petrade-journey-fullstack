# PeTrade Journey

Aplikasi jurnal trading dan pelacak performa menggunakan React + Vite dan backend NestJS. Pengguna dapat menambah, membaca, mengubah, dan menghapus trade; ringkasan performa dan saldo jurnal mengikuti data dari backend.

Implementasi ini mengikuti **Tugas 9: NestJS Dasar + Struktur MVC**, mengacu pada Modul 9 buku Pemrograman Web kampus (halaman tercetak 91-100). Penyimpanan memakai array memori sesuai tugas: refresh browser tetap membaca data backend yang sama, tetapi restart backend mengosongkan jurnal.

## Menjalankan aplikasi

Prasyarat: Node.js 20.19+ (pengujian menggunakan Node.js 24), npm, dan dua terminal. Pada Windows, gunakan `npm.cmd` jika PowerShell memblokir `npm.ps1`.

Instal dependency dari folder utama:

```powershell
npm.cmd install
npm.cmd --prefix backend install
```

Terminal pertama, jalankan backend:

```powershell
npm.cmd run dev:api
```

Terminal kedua, jalankan frontend:

```powershell
npm.cmd run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/trades
- REST client lokal: http://localhost:5173/docs/tugas-9-client.html

Frontend menggunakan backend localhost:3001 secara default. Untuk alamat lain, salin `.env.example` menjadi `.env.local`, atur `VITE_API_URL`, lalu restart Vite. Backend membaca environment variable `PORT` (default 3001) dan `CORS_ORIGIN` (daftar origin dipisahkan koma); default CORS mengizinkan localhost:5173 dan 127.0.0.1:5173.

## Pemenuhan kriteria Tugas 9

| No. | Kriteria tugas | Implementasi / bukti |
| --- | --- | --- |
| 1 | Satu data utama | Trade, yaitu catatan transaksi trading |
| 2 | Resource dari Nest CLI, entity minimal lima field dengan tipe bervariasi | [Entity Trade](backend/src/trades/entities/trade.entity.ts): 11 field, termasuk string, number, boolean, union posisi/hasil, tanggal ISO dan timestamp |
| 3 | CRUD array memori | [TradesService](backend/src/trades/trades.service.ts): create, findAll, findOne, update, remove |
| 4 | GET, POST, PATCH, DELETE dan DI | [TradesController](backend/src/trades/trades.controller.ts), service di-inject melalui constructor dan didaftarkan di [TradesModule](backend/src/trades/trades.module.ts) |
| 5 | DTO create/update, minimal tiga validasi, ValidationPipe global | [CreateTradeDto](backend/src/trades/dto/create-trade.dto.ts), [UpdateTradeDto](backend/src/trades/dto/update-trade.dto.ts), dan [configureApp](backend/src/configure-app.ts) |
| 6 | Minimal dua skenario exception bawaan | NotFoundException (404) untuk ID tidak ada; BadRequestException (400) untuk hasil/P&L tidak konsisten dan PATCH kosong |
| 7 | Uji endpoint dengan REST client dan screenshot request/response | [Request REST Client VS Code](docs/trades.http), REST client browser lokal, [screenshot 06-15](docs/screenshots/tugas-9/README.md) |
| 8 | Integrasi frontend: tambah, ubah, hapus | [API client](src/lib/api.js), [App](src/App.jsx), [TradeForm](src/components/TradeForm.jsx), [TradeList](src/components/TradeList.jsx), [screenshot 16-28](docs/screenshots/tugas-9/README.md) |

Proyek backend dibuat menggunakan Nest CLI dengan `--skip-git`. Resource benar-benar dihasilkan dengan perintah berikut, lalu entity, service, controller dan DTO disesuaikan:

```text
npx --yes @nestjs/cli@11 new backend --package-manager npm --skip-git --skip-install --strict
npx --yes @nestjs/cli@11 generate resource trades --type rest --crud --no-spec
```

## Struktur MVC dan alur data

```text
React (View)
  -> src/lib/api.js (fetch)
  -> TradesController (routing HTTP)
  -> TradesService (logika bisnis dan array Trade[])
  -> respons JSON
  -> state React dan ringkasan diperbarui
```

```text
backend/src/
  main.ts                      Bootstrap server port 3001
  configure-app.ts             CORS dan ValidationPipe global
  app.module.ts                Mendaftarkan TradesModule
  trades/
    trades.module.ts           Controllers dan providers
    trades.controller.ts       Endpoint REST dan dependency injection
    trades.service.ts          CRUD array dan aturan bisnis
    entities/trade.entity.ts    Struktur data Trade
    dto/create-trade.dto.ts     Validasi data baru
    dto/update-trade.dto.ts     PATCH menggunakan PartialType
```

Field Trade: `id`, `tanggal`, `pair`, `posisi`, `lotSize`, `hasil`, `profitLoss`, `catatan`, `sesuaiRencana`, `createdAt`, dan `updatedAt`. ID dan timestamp dibuat backend. Field catatan dan sesuaiRencana bersifat opsional saat create, dengan default string kosong dan false.

Aturan DTO mencakup IsDateString, IsString, MinLength, MaxLength, Matches, IsIn, IsNumber, Min, dan IsBoolean. Pair dinormalisasi menjadi huruf besar. Lot minimal 0.01; lot dan profit/loss maksimal dua desimal. ValidationPipe memakai `whitelist`, `forbidNonWhitelisted`, dan `transform`.

Win harus memiliki profit positif; Loss negatif; Break Even tepat 0. Pada PATCH, aturan ini diperiksa terhadap gabungan data lama dan perubahan baru sebelum array diubah. Beberapa trade dengan pair dan tanggal yang sama diperbolehkan karena merupakan transaksi terpisah.

## Endpoint

| Method | Endpoint | Sukses | Fungsi |
| --- | --- | --- | --- |
| GET | /trades | 200 + array JSON | Semua trade, tanggal terbaru dahulu |
| GET | /trades/:id | 200 + objek JSON | Detail trade |
| POST | /trades | 201 + objek JSON | Tambah trade |
| PATCH | /trades/:id | 200 + objek JSON | Ubah sebagian field |
| DELETE | /trades/:id | 204 tanpa body | Hapus trade |

Error menggunakan format bawaan NestJS dengan `statusCode`, `message`, dan `error`. Frontend menampilkan pesan validasi dari API, mempertahankan input jika penyimpanan gagal, dan menyediakan tombol muat ulang ketika daftar gagal dimuat.

## Pengujian dan screenshot

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run build:api
npm.cmd run test:api
npm.cmd run test:ui
```

- Pengujian API menggunakan Jest + Supertest: CRUD lengkap, input DTO, PATCH atomik, nilai default, 400/404, dan preflight CORS.
- Pengujian browser menggunakan Playwright + Microsoft Edge: request REST terlebih dahulu, lalu alur form React, reload data, edit, batal hapus, hapus, pembaruan ringkasan, tampilan mobile, dan kegagalan jaringan.
- `test:ui` menyalakan server pengujian terpisah di port 3002 dan 5174, lalu mematikannya setelah selesai. Pastikan kedua port tersedia. Jalankan `build:api` lebih dahulu jika backend berubah.
- Pengujian browser mengambil ulang **28 screenshot nyata** ke [docs/screenshots/tugas-9](docs/screenshots/tugas-9/README.md). Screenshot 01-05 menampilkan kode asli melalui halaman pendamping; 06-15 menampilkan request/response REST client browser; 16-28 menampilkan aplikasi React.
- Untuk menggunakan Chromium, jalankan `npx.cmd playwright install chromium`, lalu set `$env:PLAYWRIGHT_BROWSER_CHANNEL = 'chromium'` sebelum `test:ui`. Default menggunakan Microsoft Edge yang terpasang di Windows.
- Untuk pengujian manual di ekstensi REST Client VS Code, buka [docs/trades.http](docs/trades.http), klik **Send Request** berurutan. ID dari POST otomatis dipakai request detail, PATCH, dan DELETE. Screenshot yang disediakan berasal dari REST client browser pendamping, bukan tampilan ekstensi VS Code.

Pada pengujian browser, API market eksternal sengaja dibuat gagal secara terkontrol agar bukti CRUD lokal tidak bergantung pada layanan eksternal. Pada pemakaian biasa, chart tetap mengambil data asli seperti sebelumnya.

## Fitur tugas sebelumnya

Chart EUR/USD tetap menggunakan fetch ke `https://biquote.io/api/EURUSD/ohlc?interval=5m&limit=100` dengan pilihan M1/M5/M15, loading, error, tombol coba lagi, grafik candlestick, dan daftar 10 candle terakhir. Ketersediaan chart bergantung pada API eksternal tersebut. Ringkasan akun menampilkan saldo awal contoh $5,000 ditambah total profit/loss jurnal.

## Pengumpulan

Kode dan screenshot lokal sudah disiapkan. Pembuatan repository baru, commit, push GitHub, serta pengumpulan tautan repository ke LMS dilakukan oleh pemilik proyek.

Referensi implementasi: [NestJS CRUD generator](https://docs.nestjs.com/recipes/crud-generator), [ValidationPipe dan DTO](https://docs.nestjs.com/techniques/validation).
