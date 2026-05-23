import {
  type ApiMultipartRequestOptions,
  apiMultipartRequest,
  apiRequest,
} from "@/api/client";

// Thin, Axios-like wrapper over the existing fetch-based apiRequest /
// apiMultipartRequest. Auth headers, base URL resolution, JSON parsing, and
// error handling all stay in `@/api/client` — this module only swaps the
// `{ method, body }` shape for method-specific helpers so service files can
// read more like the v2 convention without taking on Axios.

type MultipartMethod = NonNullable<ApiMultipartRequestOptions["method"]>;

const get = <T>(url: string): Promise<T> => apiRequest<T>(url);

const post = <T>(url: string, body?: unknown): Promise<T> =>
  apiRequest<T>(url, { method: "POST", body });

const put = <T>(url: string, body?: unknown): Promise<T> =>
  apiRequest<T>(url, { method: "PUT", body });

const patch = <T>(url: string, body?: unknown): Promise<T> =>
  apiRequest<T>(url, { method: "PATCH", body });

// `delete` is a reserved word, so keep the export key as `delete` while the
// underlying function is named `del` for safety.
const del = <T>(url: string): Promise<T> =>
  apiRequest<T>(url, { method: "DELETE" });

const upload = <T>(
  url: string,
  formData: FormData,
  options: { method?: MultipartMethod } = {},
): Promise<T> =>
  apiMultipartRequest<T>(url, {
    formData,
    method: options.method ?? "POST",
  });

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
};
