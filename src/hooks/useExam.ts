// ptphongkmf/prn232-react-frontend/prn232-react-frontend-b7892c25088502cf8fc9e7f23a046107485e59c5/src/hooks/useExam.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { kyAspDotnet } from "src/services/ApiService";
import { createApiSuccessResponseSchema } from "src/types/genericApiResponse";
import * as v from "valibot";

// === Types ===

// DTO an toàn nhận về từ Backend (không có IsCorrect)
export interface StudentAnswerResponse {
  id: number;
  content: string;
}

export interface StudentQuestionResponse {
  id: number;
  content: string;
  type: "Single" | "Multiple";
  answers: StudentAnswerResponse[];
}

// DTO gửi đi khi nộp bài
export interface StudentAnswerSubmission {
  questionId: number;
  answerIds: number[];
}

export interface ExamSubmission {
  answers: StudentAnswerSubmission[];
}

// DTO nhận về sau khi nộp bài
export interface ExamResult {
  examId: number;
  examName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

// DTO cho trang lịch sử
export interface UserExamHistory {
    id: number;
    examId: number;
    examName: string;
    score: number;
    submittedAt: string;
    content: string; // JSON string của bài làm
}

// DTO cho trang danh sách
export interface PublicExamInfo {
    id: number;
    name: string;
    content: string;
    teacherId: number;
    teacherName: string;
    questionsCount: number;
}

// === Hooks ===

/**
 * Lấy danh sách tất cả các exam public
 */
export function usePublicExams() {
  return useQuery<PublicExamInfo[], HTTPError>({
    queryKey: ["publicExams"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/Exams/public").json();
      const parsed = v.parse(
        createApiSuccessResponseSchema(v.array(v.any())),
        response,
      );
      return parsed.data as PublicExamInfo[];
    },
    retry: false,
  });
}

/**
 * Lấy các câu hỏi (an toàn) cho một exam cụ thể
 */
export function useExamQuestions(examId: number) {
  return useQuery<StudentQuestionResponse[], HTTPError>({
    queryKey: ["examQuestions", examId],
    queryFn: async () => {
      const response = await kyAspDotnet
        .get(`api/Exams/${examId}/questions`)
        .json();
      const parsed = v.parse(
        createApiSuccessResponseSchema(v.array(v.any())),
        response,
      );
      return parsed.data as StudentQuestionResponse[];
    },
    enabled: !!examId,
    retry: false,
  });
}

/**
 * Nộp bài
 */
export function useSubmitExamMutation(examId: number) {
  return useMutation<ExamResult, HTTPError, ExamSubmission>({
    mutationFn: async (submissionData) => {
      const response = await kyAspDotnet
        .post(`api/Exams/${examId}/submit`, {
          json: submissionData,
        })
        .json();
      const parsed = v.parse(createApiSuccessResponseSchema(v.any()), response);
      return parsed.data as ExamResult;
    },
  });
}

/**
 * Lấy lịch sử thi
 */
export function useExamHistory() {
  return useQuery<UserExamHistory[], HTTPError>({
    queryKey: ["examHistory"],
    queryFn: async () => {
      const response = await kyAspDotnet.get("api/Exams/history").json();
      const parsed = v.parse(
        createApiSuccessResponseSchema(v.array(v.any())),
        response,
      );
      return parsed.data as UserExamHistory[];
    },
    retry: false,
  });
}