import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const TradingChart = ({ data }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { color: '#0F1115' },
          textColor: '#FFFFFF',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
        },
      });

      // Add candlestick series using correct API
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00F090',
        downColor: '#FF2E50',
        borderUpColor: '#00F090',
        borderDownColor: '#FF2E50',
        wickUpColor: '#00F090',
        wickDownColor: '#FF2E50',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (error) {
      console.error('Chart initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      try {
        seriesRef.current.setData(data);
      } catch (error) {
        console.error('Chart data error:', error);
      }
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full" data-testid="trading-chart" />;
};

export default TradingChart;
