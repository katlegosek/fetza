import {
  type ApiMultipartRequestOptions,
  apiMultipartRequest,
  apiRequest,
} from "@/api/client";

// Thin, Axios-like wrapper over the existing fetch-based apiRequest /
// apiMultipartRequest. Auth headers, base URL resolution, JSON parsing,
// and error handling all stay in `@/api/client` — this module only
// swaps the `{ method, body }` shape for method-specific helpers so
// service files can read more like the v2 convention without taking on
// Axios.
//
// Each method takes two generics:
//   TResponse — the *raw* response type before Zod parsing. Most
//               services pass `unknown` here and hand the result to a
//               model parser; that is intentional because we don't
//               trust the wire shape until Zod has validated it.
//   TBody     — the request body type. Defaults to `unknown` so legacy
//               callers keep working, but services should specify it so
//               unknown does not leak into call sites.

type MultipartMethod = NonNullable<ApiMultipartRequestOptions["method"]>;

const get = <TResponse>(url: string): Promise<TResponse> =>
  apiRequest<TResponse>(url);

const post = <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> => apiRequest<TResponse>(url, { method: "POST", body });

const put = <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> => apiRequest<TResponse>(url, { method: "PUT", body });

const patch = <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<TResponse> => apiRequest<TResponse>(url, { method: "PATCH", body });

// `delete` is a reserved word, so keep the export key as `delete` while
// the underlying function is named `del` for safety.
const del = <TResponse>(url: string): Promise<TResponse> =>
  apiRequest<TResponse>(url, { method: "DELETE" });

const upload = <TResponse>(
  url: string,
  formData: FormData,
  options: { method?: MultipartMethod } = {},
): Promise<TResponse> =>
  apiMultipartRequest<TResponse>(url, {
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
