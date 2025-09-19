import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "store/config";
import { getStudentByUserThunk } from "store/student/studentThunks";
import StudentProfileDisplay from "./StudentProfileDisplay";
import StudentProfileCreate from "./StudentProfileCreate";
import StudentProfileLoading from "./StudentProfileLoading";
import StudentProfileEmpty from "./StudentProfileEmpty";

interface StudentProfileSectionProps {
  onStudentCreated?: () => void;
}

export default function StudentProfileSection({ 
  onStudentCreated 
}: StudentProfileSectionProps) {
  const dispatch = useAppDispatch();
  
  // Optimized selector to avoid unnecessary re-renders
  const { studentData, isLoading } = useAppSelector(
    (state) => ({
      studentData: state.student.currentStudent.data,
      isLoading: state.student.currentStudent.isLoading
    })
  );

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized function to check student profile
  const checkStudentProfile = useCallback(async () => {
    if (isInitialized || isLoading) {
      return; // Prevent duplicate calls
    }
    
    try {
      const result = await dispatch(getStudentByUserThunk()).unwrap();
      if (result) {
        setHasProfile(true);
      }
    } catch (error: any) {
      if (error.includes("404") || error === "NO_STUDENT_PROFILE") {
        setHasProfile(false);
      } else {
        setHasProfile(false);
      }
    } finally {
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized, isLoading]);

  // Effect to initialize profile check - only run once
  useEffect(() => {
    if (!isInitialized && !studentData) {
      checkStudentProfile();
    } else if (studentData && !isInitialized) {
      setHasProfile(true);
      setIsInitialized(true);
    }
  }, [checkStudentProfile, studentData, isInitialized]);

  // Separate effect to handle studentData changes after initialization
  useEffect(() => {
    if (isInitialized) {
      setHasProfile(!!studentData);
    }
  }, [studentData, isInitialized]);

  const handleStudentCreated = () => {
    setHasProfile(true);
    setShowCreateForm(false);
    onStudentCreated?.();
  };

  const handleStartCreate = () => {
    setShowCreateForm(true);
  };

  // Show loading if Redux is loading or we haven't initialized yet
  if (isLoading || (!isInitialized && hasProfile === null)) {
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