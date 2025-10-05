import { createApiErrorResponseSchema, createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import { PagnitionSchema } from "src/types/pagnition";
import { AnswerSchema } from "src/types/question/answer";
import { TagSchema } from "src/types/tag/tag";
import * as v from "valibot";

const QuestionSchema = v.object({
  id: v.pipe(v.number(), v.integer()),
  content: v.pipe(v.string(), v.nonEmpty()),
  type: v.pipe(v.string(), v.nonEmpty()),
  teacherId: v.pipe(v.number(), v.integer()),
  teacherName: v.pipe(v.string(), v.nonEmpty()),
  deleteable: v.boolean(),
  createdAt: v.pipe(
    v.string(),
    v.transform((d) => new Date(d)),
  ),
});

export const QuestionRequestSchema = v.object({
  ...PagnitionSchema.entries,
  searchTerm: v.string(),
  tagIds: v.array(v.pipe(v.number(), v.integer())),
  sortByDateDescending: v.boolean(),
  from: v.nullable(v.string()),
  to: v.nullable(v.string()),
});

const QuestionWithDetailSchema = v.object({
  answers: v.array(AnswerSchema),
  tags: v.array(TagSchema),
  ...QuestionSchema.entries,
});

const PagnitedQuestionWithDetailSchema = v.object({
  results: v.array(QuestionWithDetailSchema),
  pagnition: PagnitionSchema,
});

export const PagnitedQuestionWithDetailSuccessResponseSchema = createApiSuccessResponseSchema(
  PagnitedQuestionWithDetailSchema,
);
const PagnitedQuestionWithDetailErrorResponseSchema = createApiErrorResponseSchema(PagnitedQuestionWithDetailSchema);

export type QuestionRequest = v.InferOutput<typeof QuestionRequestSchema>;
export type PagnitedQuestionWithDetailSuccessResponse = v.InferOutput<
  typeof PagnitedQuestionWithDetailSuccessResponseSchema
>;
export type PagnitedQuestionWithDetailErrorResponse = v.InferOutput<
  typeof PagnitedQuestionWithDetailErrorResponseSchema
>;

export const UpdateQuestionSchema = v.object({
  content: v.pipe(v.string(), v.nonEmpty()),
  type: v.pipe(v.string(), v.nonEmpty()),
  answers: v.array(AnswerSchema),
  tagIds: v.array(v.pipe(v.number(), v.integer())),
});

export type QuestionWithDetail = v.InferOutput<typeof QuestionWithDetailSchema>;
export type UpdateQuestion = v.InferOutput<typeof UpdateQuestionSchema>;
