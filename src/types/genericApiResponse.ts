import * as v from "valibot";

export function ApiSuccessResponseSchema<TSchema extends v.GenericSchema>(dataSchema: TSchema) {
  return v.object({
    statusCode: v.number(),
    message: v.nullable(v.string()),
    data: dataSchema,
  });
}

export function ApiErrorResponseSchema<TSchema extends v.GenericSchema>(dataSchema: TSchema) {
  return v.object({
    statusCode: v.number(),
    message: v.nullable(v.string()),
    data: v.nullable(dataSchema),
  });
}
