
import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

function ForexChart() {
  const [timeframe, setTimeframe] = useState('5m');
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function ambilCandle() {
      try {
        const url =
          `https://biquote.io/api/EURUSD/ohlc?interval=${timeframe}&limit=100`;

        const response = await fetch(url, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.bars) || data.bars.length === 0) {
          throw new Error('Data candle tidak tersedia');
        }

        const hasil = data.bars
          .map((item) => ({
            time: Math.floor(new Date(item.openTime).getTime() / 1000),
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close)
          }))
          .filter((item) =>
            Object.values(item).every(Number.isFinite)
          )
          .sort((a, b) => a.time - b.time);

        if (hasil.length === 0) {
          throw new Error('Format data candle tidak valid');
        }

        if (!controller.signal.aborted) {
          setCandles(hasil);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(`Gagal mengambil data: ${err.message}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    ambilCandle();

    return () => controller.abort();
  }, [timeframe, retry]);

  useEffect(() => {
    if (loading || error || candles.length === 0 || !chartRef.current) {
      return;
    }

    const container = chartRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 350,
      layout: {
        background: { type: 'solid', color: '#1e293b' },
        textColor: '#cbd5e1'
      }
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444'
    });

    series.setData(candles);
    chart.timeScale().fitContent();

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [candles, loading, error]);

  function cobaLagi() {
    setLoading(true);
    setError('');
    setCandles([]);
    setRetry((sebelumnya) => sebelumnya + 1);
  }

  function gantiTimeframe(event) {
    setLoading(true);
    setError('');
    setCandles([]);
    setTimeframe(event.target.value);
  }

  return (
    <section className="forex-chart-section">
      <h2>Market Analysis - EUR/USD</h2>
      <p>Chart forex menggunakan data dari API eksternal.</p>

      <label>
        Timeframe:{' '}
        <select value={timeframe} onChange={gantiTimeframe}>
          <option value="1m">M1</option>
          <option value="5m">M5</option>
          <option value="15m">M15</option>
        </select>
      </label>

      {loading && <p role="status">Memuat data candle...</p>}

      {!loading && error && (
        <div className="forex-error">
          <p role="alert">{error}</p>
          <button onClick={cobaLagi}>Coba Lagi</button>
        </div>
      )}

      {!loading && !error && candles.length > 0 && (
        <>
          <div ref={chartRef} className="forex-chart-box" />

          <p>
            Chart menggunakan{' '}
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noreferrer"
            >
              TradingView Lightweight Charts
            </a>
          </p>

          <h3>Daftar Candle</h3>

          <div className="trade-table-wrapper">
            <table className="trade-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Open</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Close</th>
                </tr>
              </thead>
              <tbody>
                {candles.slice(-10).map((item) => (
                  <tr key={item.time}>
                    <td>
                      {new Date(item.time * 1000)
                        .toLocaleString('id-ID', {
                          timeZone: 'Asia/Jakarta'
                        })}
                    </td>
                    <td>{item.open}</td>
                    <td>{item.high}</td>
                    <td>{item.low}</td>
                    <td>{item.close}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default ForexChart;
