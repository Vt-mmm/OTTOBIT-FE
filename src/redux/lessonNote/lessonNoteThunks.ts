import { createAsyncThunk } from "@reduxjs/toolkit";

// Local action creators
const setMessageSuccess = (message: string) => ({
  type: "lessonNote/setMessageSuccess",
  payload: message,
});

const setMessageError = (message: string) => ({
  type: "lessonNote/setMessageError",
  payload: message,
});
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
    const requestParams = {
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 10,
      LessonId: params.lessonId,
      CourseId: params.courseId,
      LessonResourceId: params.lessonResourceId,
      SearchTerm: params.searchTerm,
    };
    
    console.log("🌐 API Request params:", requestParams); // Debug log
    
    const response = await axiosClient.get(ROUTES_API_LESSON_NOTE.MY_NOTES, {
      params: requestParams,
    });

    // Extract pagination data from response
    const result = {
      items: response.data.data.items,
      page: response.data.data.page,
      size: response.data.data.size,
      total: response.data.data.total,
      totalPages: response.data.data.totalPages,
    };
    
    console.log("✅ API Response:", `Page ${result.page}/${result.totalPages}, ${result.items.length} items`); // Debug log
    
    return result;
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
>("lessonNote/createLessonNote", async (payload, thunkAPI) => {
  try {
    const response = await axiosClient.post(
      ROUTES_API_LESSON_NOTE.CREATE,
      payload
    );

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã tạo ghi chú thành công!"));

    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to create lesson note";

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Update an existing lesson note
export const updateLessonNote = createAsyncThunk<
  LessonNote,
  { id: string; payload: UpdateLessonNotePayload },
  { rejectValue: string }
>(
  "lessonNote/updateLessonNote",
  async ({ id, payload }, thunkAPI) => {
    try {
      const response = await axiosClient.put(
        ROUTES_API_LESSON_NOTE.UPDATE(id),
        payload
      );

      // Success toast
      thunkAPI.dispatch(setMessageSuccess("Đã cập nhật ghi chú!"));

      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update lesson note";

      // Error toast
      thunkAPI.dispatch(setMessageError(errorMessage));

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Delete a lesson note
export const deleteLessonNote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("lessonNote/deleteLessonNote", async (id, thunkAPI) => {
  try {
    await axiosClient.delete(ROUTES_API_LESSON_NOTE.DELETE(id));

    // Success toast
    thunkAPI.dispatch(setMessageSuccess("Đã xóa ghi chú!"));

    return id; // Return the deleted note ID
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to delete lesson note";

    // Error toast
    thunkAPI.dispatch(setMessageError(errorMessage));

    return thunkAPI.rejectWithValue(errorMessage);
  }
});
