'use client'

import { ReactNode } from 'react';
import { ThirdwebProvider as Provider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

export default function ClientThirdwebProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  
  if (!clientId) {
    console.error("Thirdweb client ID is not defined");
    return <>{children}</>;
  }
  
  const _client = createThirdwebClient({
    clientId,
  });
  
  return (
    <Provider>
      {children}
    </Provider>
  );
}
