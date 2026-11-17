import { useMutation } from "@tanstack/react-query";

import { deleteAllAccountData } from "../data/account.repository";

export function useDeleteAllData() {
  return useMutation({
    mutationFn: deleteAllAccountData,
  });
}
