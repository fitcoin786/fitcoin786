import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useFitcoinPrice = (updateInterval = 5000) => {
  const [priceData, setPriceData] = useState({
    price: 0.00000349400,
    change_24h: 0,
    volume_24h: 0,
    market_cap: 0,
    high_24h: 0,
    low_24h: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(`${API}/price/fitcoin`);
        setPriceData({
          ...response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to fetch FTC price:', error);
        setPriceData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch price'
        }));
      }
    };

    fetchPrice(); // Initial fetch
    const interval = setInterval(fetchPrice, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return priceData;
};

export default useFitcoinPrice;
