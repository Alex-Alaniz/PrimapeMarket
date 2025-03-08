
'use client'

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import ThirdwebProvider to avoid chunk loading issues
const ThirdwebProvider = dynamic(
  () => import("thirdweb/react").then((mod) => mod.ThirdwebProvider),
  { ssr: false }
);

export default function ClientThirdwebProvider({ children }: { children: ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
