import { useEffect } from "react";
import { Box, Container, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getRobotsThunk } from "store/robot/robotThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import ProductCard from "components/store/ProductCard";

export default function FeaturedRobotsSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { robots } = useAppSelector((state) => state.robot);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch featured robots (limit to 4 for display)
    dispatch(getRobotsThunk({
      page: 1,
      size: 4,
    }));
  }, [dispatch]);

  const handleViewAllRobots = () => {
    navigate(isAuthenticated ? PATH_USER.robots : PATH_PUBLIC.robots);
  };

  const handleRobotClick = (robotId: string) => {
    const path = isAuthenticated 
      ? PATH_USER.robotDetail.replace(':id', robotId)
      : PATH_PUBLIC.robotDetail.replace(':id', robotId);
    navigate(path);
  };

  const robotList = robots.data?.items || [];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
            }}
          >
            Featured Educational Robots
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              mb: 4,
              fontWeight: 400,
            }}
          >
            Discover our most popular robots perfect for learning programming and robotics
          </Typography>
        </Box>

        {robots.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {robotList.slice(0, 4).map((robot) => (
                <Grid item xs={12} sm={6} md={3} key={robot.id}>
                  <ProductCard
                    id={robot.id}
                    name={robot.name}
                    imageUrl={robot.imageUrl}
                    description={robot.description}
                    onClick={() => handleRobotClick(robot.id)}
                    type="robot"
                    brand={robot.brand}
                    model={robot.model}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleViewAllRobots}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #5a6fd8, #6a4190)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                View All Robots
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}