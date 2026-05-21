import { z } from "zod";

/** ISO 8601 timestamp string from the Rails API. */
export const IsoDateTimeSchema = z.string();

export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;
