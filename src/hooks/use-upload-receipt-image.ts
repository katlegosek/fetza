import { useMutation } from "@tanstack/react-query";

import { uploadReceiptImage } from "@/api/billApi";

export type UploadReceiptImageVariables = {
  billId: number;
  formData: FormData;
};

export function useUploadReceiptImage() {
  return useMutation({
    mutationFn: ({ billId, formData }: UploadReceiptImageVariables) =>
      uploadReceiptImage(billId, formData),
  });
}
