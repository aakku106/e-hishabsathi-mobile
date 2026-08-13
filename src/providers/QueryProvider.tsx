import { QueryClientProvider } from "@tanstack/react-query";
import React, { PropsWithChildren, useState } from "react";

import { queryClient } from "@/lib/queryClient";

export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [client] = useState(() => queryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default QueryProvider;
