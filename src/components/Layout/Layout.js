// src/components/Layout/Layout.js
import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={9}>
                        {children}
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Sidebar />
                    </Grid>
                </Grid>
            </Container>
            <Footer />
        </Box>
    );
};

export default Layout;
