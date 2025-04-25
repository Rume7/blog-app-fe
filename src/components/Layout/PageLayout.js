import React from 'react';
import { Container } from '@mui/material';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Breadcrumbs from './Breadcrumbs';

const PageLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Breadcrumbs />
                {children}
            </Container>
            <Footer />
        </>
    );
};

export default PageLayout; 