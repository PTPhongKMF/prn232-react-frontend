import * as v from "valibot";

export function genericApiResponseSchema<TSchema extends v.GenericSchema>(dataSchema: TSchema) {
  return v.object({
    statusCode: v.number(),
    message: v.nullable(v.string()),
    data: v.nullable(dataSchema),
  });
}
