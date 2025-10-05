import * as v from "valibot";

export const AnswerSchema = v.object({
  content: v.pipe(v.string(), v.nonEmpty()),
  isCorrect: v.boolean(),
});
