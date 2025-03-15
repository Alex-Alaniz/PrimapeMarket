'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export function useUserBalance() {
  const account = useActiveAccount();
  const [balance, setBalance] = useState('0');
  const [portfolio, setPortfolio] = useState('0');
  const [pnl, setPnl] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false); // Snackbar visibility

  const API_URL = 'https://6403d8d8.engine-usw2.thirdweb.com/backend-wallet';
  const CHAIN_ID = '33139';
  const AUTH_TOKEN = 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweDAxNjc1N2REZjJBYjZhOTk4YTQ3MjlBODBhMDkxMzA4ZDkwNTlFMTciLCJzdWIiOiIweDU1YTM4Q2IwZTA3NTNBNjQyNjViYUNGNzJGYUNkNDExMmEwNjBFMzUiLCJhdWQiOiJ0aGlyZHdlYi5jb20iLCJleHAiOjE3NDE5ODU3MTAsIm5iZiI6MTc0MTcyNTkwNywiaWF0IjoxNzQxNzI2NTEwLCJqdGkiOiI4ZDhkNTk4YTZkZTUyNWI0MWNhZTgwZmVlZDU0NDVjZmUxMzg2ZTcyOTBiZjAzNzYwNjFhNzc0MzM3MTgyNmUyIiwiY3R4Ijp7fX0.MHhkYzZiMjI4YzM5NDhiMDBlMTE4M2Q0NDQ1MWZlYjVjYTg1M2E5MGU4ZTRkZGJiMTM1MmVlNzZlNjIxMmU2NTcxNTY1ZDZkMjk0ZDM2NmQwZTdiYmQ0MGU5MGMzMjkyZWRkZTA4YmExY2ZhYTllZGU2NjRhZTFmODYwYjYzYWEzOTFj';

  const fetchBalance = async () => {
    if (!account?.address) {
      setBalance('0');
      setPortfolio('0');
      setPnl('0');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOpen(false);

      const response = await fetch(
        `${API_URL}/${CHAIN_ID}/${account.address}/get-balance`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${AUTH_TOKEN}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      // Log response and return early for now
      console.log("Balance Data:", await response.json());
      setBalance('0'); // Set a default value
      
      // Commented out code that would cause errors
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch balance (Status: ${response.status})`);
      // }
      // const data = await response.json();
      // if (!data.result || !data.result.displayValue) {
      //   throw new Error('Invalid response data');
      // }
      // setBalance(data.result.displayValue);
    } catch (error: unknown) {
      console.error('Error fetching balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch balance');
      setOpen(true); // Show snackbar with error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // Return an object with all the values
  return {
    balance,
    portfolio,
    pnl,
    loading,
    error,
    open,
    setOpen
  };
}
