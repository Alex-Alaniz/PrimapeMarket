'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import * as Toast from '@radix-ui/react-toast';

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
      )
        .then(response => response.json())
        .then(data => console.log("Balance Data:", data))
        .catch(error => console.error("Error fetching balance:", error));


      // if (!response.ok) {
      //   throw new Error(`Failed to fetch balance (Status: ${response.status})`);
      // }

      const data = await response.json();

      if (!data.result || !data.result.displayValue) {
        throw new Error('Invalid response data');
      }

      setBalance(data.result.displayValue);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err.message || 'Failed to fetch balance');// Show snackbar with error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [account]);

  return (
    <>
      {/* Display Balance */}
      <div className="text-lg font-bold">
        {loading ? 'Loading...' : `Balance: ${balance}`}
      </div>

      {/* Error Snackbar */}
      <Toast.Provider>
        <Toast.Root className="bg-red-600 text-white p-3 rounded shadow-lg" open={open} onOpenChange={setOpen}>
          <Toast.Title className="font-bold">Error</Toast.Title>
          <Toast.Description>{error}</Toast.Description>
          <Toast.Action asChild altText="Close">
            <button className="bg-white text-red-600 px-2 py-1 rounded mt-2">Close</button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4 w-64" />
      </Toast.Provider>
    </>
  );
}
