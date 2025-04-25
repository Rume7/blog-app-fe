import React from 'react';
import { Paper, Typography, Box, Avatar, Button, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography>Please log in to view your profile.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar 
                    sx={{ 
                        width: 100, 
                        height: 100, 
                        fontSize: '2.5rem',
                        mx: 'auto',
                        mb: 2
                    }}
                >
                    {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                    {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {user.email}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" gutterBottom>
                            Account Information
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Username
                            </Typography>
                            <Typography variant="body1">
                                {user.username}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography variant="body1">
                                {user.email}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" gutterBottom>
                            Actions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" color="primary">
                                Edit Profile
                            </Button>
                            <Button variant="outlined" color="secondary">
                                Change Password
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default Profile; 