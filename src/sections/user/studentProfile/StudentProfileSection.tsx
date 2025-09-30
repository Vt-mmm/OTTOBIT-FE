import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "store/config";
import { getStudentByUserThunk } from "store/student/studentThunks";
import StudentProfileDisplay from "./StudentProfileDisplay";
import StudentProfileCreate from "./StudentProfileCreate";
import StudentProfileLoading from "./StudentProfileLoading";
import StudentProfileEmpty from "./StudentProfileEmpty";

// Cache key for localStorage
const STUDENT_PROFILE_CACHE_KEY = 'student_profile_check';

interface StudentProfileSectionProps {
  onStudentCreated?: () => void;
}

export default function StudentProfileSection({ 
  onStudentCreated 
}: StudentProfileSectionProps) {
  const dispatch = useAppDispatch();
  
  // Optimized selector with useMemo to avoid unnecessary re-renders
  const { studentData, isLoading } = useAppSelector(
    (state) => ({
      studentData: state.student.currentStudent.data,
      isLoading: state.student.currentStudent.isLoading,
      error: state.student.currentStudent.error
    }),
    (left, right) => 
      left.studentData === right.studentData && 
      left.isLoading === right.isLoading
  );

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update cache
  const updateCache = useCallback((hasProfile: boolean) => {
    try {
      localStorage.setItem(
        STUDENT_PROFILE_CACHE_KEY,
        JSON.stringify({ hasProfile, timestamp: Date.now() })
      );
    } catch (e) {
      // Ignore cache errors
    }
  }, []);

  // Memoized function to check student profile - ALWAYS call API on mount
  const checkStudentProfile = useCallback(async () => {
    if (isInitialized) {
      return; // Prevent duplicate calls after initialization
    }
    
    try {
      const result = await dispatch(getStudentByUserThunk()).unwrap();
      if (result) {
        setHasProfile(true);
        updateCache(true);
      } else {
        setHasProfile(false);
        updateCache(false);
      }
    } catch (error: any) {
      // Error means no profile exists
      setHasProfile(false);
      updateCache(false);
    } finally {
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized, updateCache]);

  // Effect to initialize profile check - ALWAYS run on mount
  useEffect(() => {
    if (!isInitialized) {
      checkStudentProfile();
    }
  }, [checkStudentProfile, isInitialized]);

  // Separate effect to handle studentData changes after initialization
  useEffect(() => {
    if (isInitialized && studentData !== undefined) {
      setHasProfile(!!studentData);
    }
  }, [studentData, isInitialized]);

  const handleStudentCreated = () => {
    setHasProfile(true);
    setShowCreateForm(false);
    updateCache(true);
    onStudentCreated?.();
  };

  const handleStartCreate = () => {
    setShowCreateForm(true);
  };

  // Show loading only if actually loading from API
  if (isLoading) {
    return <StudentProfileLoading />;
  }
  
  // If not initialized yet, show loading briefly
  if (!isInitialized) {
    return <StudentProfileLoading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

      {hasProfile ? (
        <StudentProfileDisplay />
      ) : showCreateForm ? (
        <StudentProfileCreate
          onStudentCreated={handleStudentCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      ) : (
        <StudentProfileEmpty onCreateProfile={handleStartCreate} />
      )}
    </motion.div>
  );
}