import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from 'layout/components/header/Header';
import { SecuritySettings } from 'sections/user/profile';
import { useAppSelector } from 'store/config';
import { alpha } from '@mui/material/styles';

const UserProfilePage: React.FC = () => {
  const { userAuth, userInfo } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  // Display data from auth
  const displayData = {
    fullName: userInfo?.fullName || "Chưa có tên",
    email: userAuth?.email || "Chưa có email",
    phoneNumber: "",
    avatarUrl: "",
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: '#2E7D32',
              mb: 4,
              background: 'linear-gradient(45deg, #2E7D32, #8BC34A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hồ sơ cá nhân
          </Typography>

          <Grid container spacing={4}>
            {/* Profile Overview Card */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(139, 195, 74, 0.15)',
                  border: `1px solid ${alpha('#8BC34A', 0.2)}`,
                }}
              >
                {/* Header Background */}
                <Box
                  sx={{
                    height: 120,
                    background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                    position: 'relative',
                  }}
                />

                <CardContent sx={{ pt: 0, pb: 3 }}>
                  {/* Avatar and Edit Button */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                    <Avatar
                      src={displayData.avatarUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '4px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        mt: -6,
                        mr: 2,
                        background: 'linear-gradient(45deg, #8BC34A, #4CAF50)',
                        fontSize: '2rem',
                        fontWeight: 600,
                      }}
                    >
                      {displayData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        bgcolor: '#8BC34A',
                        '&:hover': { bgcolor: '#689F38' },
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Box>

                  {/* User Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#2E7D32',
                        mb: 1,
                      }}
                    >
                      {displayData.fullName}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {userAuth?.roles?.map((role) => (
                        <Chip
                          key={role}
                          label={role === 'OTTOBIT_USER' ? 'Học viên' : role}
                          size="small"
                          sx={{
                            bgcolor: alpha('#8BC34A', 0.15),
                            color: '#2E7D32',
                            fontWeight: 600,
                          }}
                          icon={<PersonIcon />}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* User Details */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha('#8BC34A', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <EmailIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {displayData.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha('#8BC34A', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <PhoneIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {displayData.phoneNumber || 'Chưa cập nhật'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={4}>
              <SecuritySettings />
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
