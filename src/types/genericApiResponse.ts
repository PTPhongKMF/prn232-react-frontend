import * as v from "valibot";

export function createApiSuccessResponseSchema<TSchema extends v.GenericSchema>(dataSchema: TSchema) {
  return v.object({
    statusCode: v.number(),
    message: v.nullable(v.string()),
    data: dataSchema,
  });
}

export function createApiErrorResponseSchema<TSchema extends v.GenericSchema>(dataSchema: TSchema) {
  return v.object({
    statusCode: v.number(),
    message: v.nullable(v.string()),
    data: v.nullable(dataSchema),
  });
}
