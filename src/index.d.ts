import { Request } from "har-format"
import { Spec } from "swagger-schema-official"

interface HarRequest {
  readonly method: string;
  readonly url: string;
  readonly description: string;
  readonly har: Request;
}

export function oasToHarList(spec: Spec | string): Promise<HarRequest[] | never>;
