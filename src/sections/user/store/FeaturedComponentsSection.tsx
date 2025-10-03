import { useEffect } from "react";
import { Box, Container, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store/config";
import { getComponentsThunk } from "store/component/componentThunks";
import { PATH_PUBLIC, PATH_USER } from "routes/paths";
import ProductCard from "components/store/ProductCard";

export default function FeaturedComponentsSection() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { components } = useAppSelector((state) => state.component);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getComponentsThunk({ page: 1, size: 4 }));
  }, [dispatch]);

  const handleViewAll = () => {
    navigate(isAuthenticated ? PATH_USER.components : PATH_PUBLIC.components);
  };

  const handleClick = (componentId: string) => {
    const path = isAuthenticated
      ? PATH_USER.componentDetail.replace(":id", componentId)
      : PATH_PUBLIC.componentDetail.replace(":id", componentId);
    navigate(path);
  };

  const list = components.data?.items || [];

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Featured Components
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 4 }}>
            Top components for your learning and robotics projects
          </Typography>
        </Box>

        {components.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {list.slice(0, 4).map((c) => (
                <Grid item xs={12} sm={6} md={3} key={c.id}>
                  <ProductCard
                    id={c.id}
                    name={c.name}
                    imageUrl={c.imageUrl}
                    description={c.description}
                    onClick={() => handleClick(c.id)}
                    type="component"
                    componentType={c.type}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: "center" }}>
              <Button variant="contained" size="large" onClick={handleViewAll}>
                View All Components
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
