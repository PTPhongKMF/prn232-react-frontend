import * as v from "valibot";

export const SlidePageCreateSchema = v.object({
  orderNumber: v.pipe(v.number(), v.minValue(1)),
  title: v.optional(v.string()),
  content: v.optional(v.string()),
});

export const SlidePageSchema = v.object({
    id: v.number(),
    slideId: v.number(),
    orderNumber: v.number(),
    title: v.nullable(v.string()),
    content: v.nullable(v.string()),
});

export const SlideCreateSchema = v.object({
  title: v.pipe(v.string(), v.minLength(3, "Title must be at least 3 characters.")),
  topic: v.optional(v.string()),
  price: v.pipe(v.number(), v.minValue(0)),
  grade: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(12))),
  isPublished: v.boolean(),
  slidePages: v.array(SlidePageCreateSchema),
});

export type SlideCreateData = v.InferOutput<typeof SlideCreateSchema>;

export const SlideSchema = v.object({
  id: v.number(),
  teacherId: v.number(),
  title: v.string(),
  topic: v.nullable(v.string()),
  contentType: v.nullable(v.string()),
  fileUrl: v.nullable(v.string()),
  price: v.number(),
  grade: v.nullable(v.number()),
  isPublished: v.boolean(),
  createdAt: v.string(),
  slidePages: v.array(v.any()),
});

export type Slide = v.InferOutput<typeof SlideSchema>;

export const SlideUpdateSchema = v.object({
  id: v.number(),
  title: v.pipe(v.string(), v.minLength(3, "Title must be at least 3 characters.")),
  topic: v.optional(v.string()),
  price: v.pipe(v.number(), v.minValue(0)),
  grade: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(12))),
  isPublished: v.boolean(),
  slidePages: v.array(SlidePageCreateSchema),
});

export type SlideUpdateData = v.InferOutput<typeof SlideUpdateSchema>;
export const TeacherSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  role: v.string(),
  grade: v.optional(v.nullable(v.number())),
});

export const SlideWithTeacherSchema = v.intersect([
  SlideSchema,
  v.object({ teacher: TeacherSchema }),
]);

export type SlideWithTeacher = v.InferOutput<typeof SlideWithTeacherSchema>;