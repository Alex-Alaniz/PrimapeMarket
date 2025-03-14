// 'use client';

// import { useState, useEffect } from 'react';
// import { useActiveAccount } from 'thirdweb/react';
// import * as Toast from '@radix-ui/react-toast';

// export function useUserBalance() {
//   const account = useActiveAccount();
//   const [balance, setBalance] = useState('0');
//   const [portfolio, setPortfolio] = useState('0');
//   const [pnl, setPnl] = useState('0');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [open, setOpen] = useState(false); // Snackbar visibility

//   const API_URL = 'https://6403d8d8.engine-usw2.thirdweb.com/backend-wallet';
//   const CHAIN_ID = '33139';
//   const secret_key = process.env.NEXT_PUBLIC_THIRDWEB_WALLET_TOKEN;

//   const fetchBalance = async () => {
//     if (!account?.address) {
//       setBalance('0');
//       setPortfolio('0');
//       setPnl('0');
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
//       setOpen(false);

//       const response = await fetch(
//         `${API_URL}/${CHAIN_ID}/${account.address}/get-balance`,
//         {
//           method: 'GET',
//           headers: {
//             'Accept': 'application/json',
//             'Authorization': `Bearer ${secret_key}`,
//             'ngrok-skip-browser-warning': 'true',
//           },
//         }
//       )
//         .then(response => response.json())
//         .then(data => console.log("Balance Data:", data))
//         .catch(error => console.error("Error fetching balance:", error));


//       // if (!response.ok) {
//       //   throw new Error(`Failed to fetch balance (Status: ${response.status})`);
//       // }

//       const data = await response.json();

//       if (!data.result || !data.result.displayValue) {
//         throw new Error('Invalid response data');
//       }

//       setBalance(data.result.displayValue);
//     } catch (err) {
//       console.error('Error fetching balance:', err);
//       setError(err.message || 'Failed to fetch balance');// Show snackbar with error message
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBalance();
//   });

//   return (
//     <>
//       {/* Display Balance */}
//       <div className="text-lg font-bold">
//         {loading ? 'Loading...' : `Balance: ${balance}`}
//       </div>

//       {/* Error Snackbar */}
//       <Toast.Provider>
//         <Toast.Root className="bg-red-600 text-white p-3 rounded shadow-lg" open={open} onOpenChange={setOpen}>
//           <Toast.Title className="font-bold">Error</Toast.Title>
//           <Toast.Description>{error}</Toast.Description>
//           <Toast.Action asChild altText="Close">
//             <button className="bg-white text-red-600 px-2 py-1 rounded mt-2">Close</button>
//           </Toast.Action>
//         </Toast.Root>
//         <Toast.Viewport className="fixed bottom-4 right-4 w-64" />
//       </Toast.Provider>
//     </>
//   );
// }
