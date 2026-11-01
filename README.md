# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Tugas 7 – AJAX dan Konsumsi API Eksternal

## 1. API yang Digunakan

API yang digunakan adalah biquote API dengan endpoint:

https://biquote.io/api/EURUSD/ohlc?interval=5m&limit=100

Saya memilih API ini karena sesuai dengan tema aplikasi Trading Journal. API tersebut menyediakan data candlestick forex yang dapat digunakan untuk melihat pergerakan harga berdasarkan timeframe tertentu.

Pada aplikasi ini, pengguna dapat memilih timeframe M1, M5, atau M15 yang dimana untuk timeframe sesuai dengan yang selalu saya pakai.

## 2. Implementasi AJAX

Pengambilan data API dilakukan menggunakan fetch() dengan async/await pada fungsi ambilCandle() di file ForexChart.jsx.

Fungsi dijalankan melalui useEffect() ketika komponen dimuat atau ketika pengguna mengganti timeframe.

Data yang berhasil diterima kemudian diolah dan disimpan sementara menggunakan setCandles() agar dapat ditampilkan pada chart dan tabel Daftar Candle.

## 3. Penanganan Loading, Success, dan Error

### Loading

Ketika proses pengambilan data berlangsung, state loading bernilai true sehingga aplikasi menampilkan pesan "Memuat data candle...".

### Success

Ketika data berhasil diterima dari API, fungsi setCandles() digunakan untuk memperbarui data candle. Setelah itu, aplikasi menampilkan chart candlestick dan tabel Daftar Candle.

### Error

Jika pengambilan data gagal, error ditangani menggunakan blok catch pada fungsi ambilCandle(). Pesan kesalahan disimpan melalui setError() dan ditampilkan kepada pengguna.

Pada kondisi error, terdapat tombol Coba Lagi yang menjalankan fungsi cobaLagi() untuk mengulangi proses pengambilan data API.

## 4. Render List

Data dari API juga ditampilkan dalam tabel Daftar Candle menggunakan .map() dengan key unik berdasarkan waktu candle.

Tabel kemudian menampilkan 10 data candle terakhir dalam bentuk yang lebih terstruktur dan mudah dibaca.
