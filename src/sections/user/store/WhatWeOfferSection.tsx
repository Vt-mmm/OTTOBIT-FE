import React from "react";
import { Box, Container, Typography, Card, Button } from "@mui/material";
import { motion } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreateIcon from "@mui/icons-material/Create";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
}

function FeatureCard({ icon, title, description, buttonText }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: "100%",
          textAlign: "center",
          p: 4,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #f0f0f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "#f8f9fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              color: "#2c3e50",
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#2c3e50",
            mb: 2,
            fontSize: "1.2rem",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#7f8c8d",
            lineHeight: 1.6,
            mb: 4,
            fontSize: "0.95rem",
          }}
        >
          {description}
        </Typography>

        <Button
          variant="text"
          sx={{
            color: "#3498db",
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "rgba(52, 152, 219, 0.1)",
            },
          }}
        >
          {buttonText}
        </Button>
      </Card>
    </motion.div>
  );
}

export default function WhatWeOfferSection() {
  const features = [
    {
      icon: <TrendingUpIcon />,
      title: "Effective marketing",
      description: "Our AI will you generate more effective marketing copy faster and cheaper than a human copywriter.",
      buttonText: "View details",
    },
    {
      icon: <LocalShippingIcon />,
      title: "AI-powered",
      description: "Say goodbye to manually creating strong pages and clever emails and making magic.",
      buttonText: "View details",
    },
    {
      icon: <CreateIcon />,
      title: "Writer's block",
      description: "Headlines is a blog writer that beats writer's block. It's the only writing tool you need.",
      buttonText: "View details",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "white",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#2c3e50",
              textAlign: "center",
              mb: 2,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            WHAT WE OFFER?
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: "#7f8c8d",
              textAlign: "center",
              mb: 8,
              fontSize: "1.1rem",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            This clean and sleek contemporary waterproof rucksack features an internal 
            laptop pocket, a main compartment, and a concealed external phone pocket 
            on the back panel.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 4,
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}