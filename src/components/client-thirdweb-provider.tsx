
'use client'

import { ReactNode } from 'react';
import { ThirdwebProvider as Provider } from "thirdweb/react";

export default function ClientThirdwebProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
