/**
 * ChallengesGrid - Grid container for challenge cards
 * Handles loading, error, and empty states
 */

import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ChallengeResult } from "../../common/@types/challenge";
import { SubmissionResult } from "../../common/@types/submission";
import {
  isChallengeAccessible,
  getChallengeProgress,
} from "../../utils/challengeUtils";
import ChallengeCard from "./ChallengeCard";
import { useLocales } from "hooks";

interface ChallengesGridProps {
  challenges: ChallengeResult[];
  submissions?: SubmissionResult[];
  loading: boolean;
  error: string | null;
  onChallengeSelect: (challengeId: string) => void;
  onRetry: () => void;
}

const ChallengesGrid: React.FC<ChallengesGridProps> = ({
  challenges,
  submissions = [],
  loading,
  error,
  onChallengeSelect,
  onRetry,
}) => {
  const { translate } = useLocales();

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {translate("challenges.LoadingChallenges")}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {translate("challenges.ErrorLoadingChallenges", { error })}
        </Alert>
        <Button variant="contained" onClick={onRetry}>
          {translate("challenges.Retry")}
        </Button>
      </Box>
    );
  }

  // Empty state
  if (challenges.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 400,
        }}
      >
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            background: "#f8f9fa",
            borderRadius: "16px",
            border: "2px dashed #e0e0e0",
            maxWidth: 400,
          }}
        >
          <Typography variant="h5" sx={{ color: "#2e3440", mb: 2 }}>
            {translate("challenges.NoChallenges")}
          </Typography>
          <Typography variant="body1" sx={{ color: "#5e6c84" }}>
            {translate("challenges.NoChallengesMessage")}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render challenges grid
  return (
    <Box
      sx={{
        width: "100%",
        // Remove flex/overflow from here - let parent handle scroll
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        alignItems="stretch"
        sx={{
          "& .MuiGrid-item": {
            display: "flex",
            height: "auto",
          },
        }}
      >
        {challenges.map((challenge) => {
          const isAccessible = isChallengeAccessible(
            challenge,
            challenges,
            submissions
          );
          const progress = getChallengeProgress(challenge.id, submissions);

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={challenge.id}
              sx={{ display: "flex" }}
            >
              <ChallengeCard
                challenge={challenge}
                isAccessible={isAccessible}
                progress={progress}
                onSelect={onChallengeSelect}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ChallengesGrid;
