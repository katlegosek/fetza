import { publicApiRequest } from "@/api/client";

const get = <TResponse>(url: string, guestToken?: string | null) =>
  publicApiRequest<TResponse>(url, { guestToken });

const post = <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  guestToken?: string | null,
) => publicApiRequest<TResponse>(url, { method: "POST", body, guestToken });

const del = <TResponse>(url: string, guestToken?: string | null) =>
  publicApiRequest<TResponse>(url, { method: "DELETE", guestToken });

export default {
  get,
  post,
  delete: del,
};
