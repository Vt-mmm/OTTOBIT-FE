import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import type { LessonNote, LessonNoteResponse } from "common/@types/lessonNote";
import {
  createLessonNote,
  deleteLessonNote,
  fetchLessonNoteById,
  fetchMyLessonNotes,
  updateLessonNote,
} from "./lessonNoteThunks";

interface LessonNoteState {
  myNotes: LessonNoteResponse | null;
  selectedNote: LessonNote | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: LessonNoteState = {
  myNotes: null,
  selectedNote: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

const lessonNoteSlice = createSlice({
  name: "lessonNote",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
    clearMyNotes: (state) => {
      // Clear notes immediately to prevent showing wrong data
      state.myNotes = null;
      state.error = null;
    },

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch my lesson notes
    builder
      .addCase(fetchMyLessonNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchMyLessonNotes.fulfilled,
        (state, action: PayloadAction<LessonNoteResponse>) => {
          state.isLoading = false;
          state.myNotes = action.payload;
        }
      )
      .addCase(fetchMyLessonNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch lesson note by ID
    builder
      .addCase(fetchLessonNoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchLessonNoteById.fulfilled,
        (state, action: PayloadAction<LessonNote>) => {
          state.isLoading = false;
          state.selectedNote = action.payload;
        }
      )
      .addCase(fetchLessonNoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create lesson note
    builder
      .addCase(createLessonNote.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(
        createLessonNote.fulfilled,
        (state, action: PayloadAction<LessonNote>) => {
          state.isCreating = false;
          // Add new note to the beginning of the list
          if (state.myNotes) {
            state.myNotes.items = [action.payload, ...state.myNotes.items];
            state.myNotes.total += 1;
          }
        }
      )
      .addCase(createLessonNote.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update lesson note
    builder
      .addCase(updateLessonNote.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateLessonNote.fulfilled,
        (state, action: PayloadAction<LessonNote>) => {
          state.isUpdating = false;
          // Update note in the list
          if (state.myNotes) {
            const index = state.myNotes.items.findIndex(
              (note) => note.id === action.payload.id
            );
            if (index !== -1) {
              state.myNotes.items[index] = action.payload;
            }
          }
          // Update selected note if it's the same
          if (state.selectedNote?.id === action.payload.id) {
            state.selectedNote = action.payload;
          }
        }
      )
      .addCase(updateLessonNote.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete lesson note
    builder
      .addCase(deleteLessonNote.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteLessonNote.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isDeleting = false;
          // Remove note from the list
          if (state.myNotes) {
            state.myNotes.items = state.myNotes.items.filter(
              (note) => note.id !== action.payload
            );
            state.myNotes.total -= 1;
          }
          // Clear selected note if it's the deleted one
          if (state.selectedNote?.id === action.payload) {
            state.selectedNote = null;
          }
        }
      )
      .addCase(deleteLessonNote.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSelectedNote,
  clearMyNotes,
  setMessageSuccess,
  setMessageError,
} = lessonNoteSlice.actions;
export default lessonNoteSlice.reducer;
