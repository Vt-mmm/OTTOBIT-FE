import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  CreateLessonNotePayload,
  GetMyLessonNotesParams,
  LessonNote,
  LessonNoteResponse,
  UpdateLessonNotePayload,
} from "common/@types/lessonNote";
import { axiosClient } from "axiosClient";
import { ROUTES_API_LESSON_NOTE } from "constants/routesApiKeys";

// Fetch my lesson notes with filters and pagination
export const fetchMyLessonNotes = createAsyncThunk<
  LessonNoteResponse,
  GetMyLessonNotesParams | undefined,
  { rejectValue: string }
>("lessonNote/fetchMyLessonNotes", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(ROUTES_API_LESSON_NOTE.MY_NOTES, {
      params: {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        LessonId: params.lessonId,
        CourseId: params.courseId,
        LessonResourceId: params.lessonResourceId,
        SearchTerm: params.searchTerm,
      },
    });

    // Extract pagination data from response
    return {
      items: response.data.data.items,
      page: response.data.data.page,
      size: response.data.data.size,
      total: response.data.data.total,
      totalPages: response.data.data.totalPages,
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch lesson notes"
    );
  }
});

// Fetch lesson note by ID
export const fetchLessonNoteById = createAsyncThunk<
  LessonNote,
  string,
  { rejectValue: string }
>("lessonNote/fetchLessonNoteById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get(
      ROUTES_API_LESSON_NOTE.GET_BY_ID(id)
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch lesson note"
    );
  }
});

// Create a new lesson note
export const createLessonNote = createAsyncThunk<
  LessonNote,
  CreateLessonNotePayload,
  { rejectValue: string }
>("lessonNote/createLessonNote", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_LESSON_NOTE.CREATE,
      payload
    );
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create lesson note"
    );
  }
});

// Update an existing lesson note
export const updateLessonNote = createAsyncThunk<
  LessonNote,
  { id: string; payload: UpdateLessonNotePayload },
  { rejectValue: string }
>(
  "lessonNote/updateLessonNote",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(
        ROUTES_API_LESSON_NOTE.UPDATE(id),
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lesson note"
      );
    }
  }
);

// Delete a lesson note
export const deleteLessonNote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("lessonNote/deleteLessonNote", async (id, { rejectWithValue }) => {
  try {
    await axiosClient.delete(ROUTES_API_LESSON_NOTE.DELETE(id));
    return id; // Return the deleted note ID
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete lesson note"
    );
  }
});
