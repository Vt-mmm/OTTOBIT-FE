import { useEffect, useState } from "react";
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
  const { currentStudent } = useAppSelector(
    (state) => state.student
  );
  const isLoading = false; // Handle loading state through API calls

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const checkStudentProfile = async () => {
      console.log('🔍 Checking student profile...');
      try {
        const result = await dispatch(getStudentByUserThunk()).unwrap();
        console.log('✅ Student profile found:', result);
        if (result) {
          setHasProfile(true);
        }
      } catch (error: any) {
        console.log('❌ Error checking student profile:', error);
        if (error.includes("404") || error === "NO_STUDENT_PROFILE") {
          console.log('📝 No profile found, showing empty state');
          setHasProfile(false);
          // Không tự động hiển thị form, để user tự click button
        } else {
          console.log('⚠️ Other error, showing empty state');
          setHasProfile(false);
        }
      }
    };

    console.log('🚀 StudentProfileSection useEffect, currentStudent:', currentStudent);
    if (!currentStudent || !currentStudent.data) {
      checkStudentProfile();
    } else {
      console.log('✅ Already has student profile');
      setHasProfile(true);
    }
  }, [dispatch, currentStudent]);

  const handleStudentCreated = () => {
    setHasProfile(true);
    setShowCreateForm(false);
    onStudentCreated?.();
  };

  const handleStartCreate = () => {
    setShowCreateForm(true);
  };

  if (isLoading || hasProfile === null) {
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