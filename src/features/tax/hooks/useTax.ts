import { useQuery } from "@tanstack/react-query";

import { fetchTaxSummary } from "../data/tax.repository";

export function useTaxSummary(month: string) {
  return useQuery({
    queryKey: ["tax", "summary", month],
    queryFn: () => fetchTaxSummary(month),
  });
}
