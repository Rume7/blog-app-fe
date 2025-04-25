import React from 'react';
import { Container, Typography, Paper, Box, Avatar } from '@mui/material';
import PageLayout from '../Layout/PageLayout';

const About = () => {
    return (
        <PageLayout>
            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                        <Avatar
                            sx={{ width: 150, height: 150, mb: 2 }}
                            alt="Profile Picture"
                            src="./profile.jpg" // Replace with your profile image path
                        />
                        <Typography variant="h4" component="h1" gutterBottom>
                            About Me
                        </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                        Welcome to my blog! I'm passionate about sharing knowledge and experiences through writing.
                        This platform is where I share my thoughts, insights, and expertise on various topics.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        My Journey
                    </Typography>
                    <Typography variant="body1" paragraph>
                        I started this blog to create a space where I can share my experiences and connect with like-minded individuals.
                        Through my posts, I aim to provide valuable content that inspires and educates readers.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        What I Write About
                    </Typography>
                    <Typography variant="body1" paragraph>
                        My blog covers a wide range of topics including technology, personal development, and creative writing.
                        Each post is crafted with care to provide meaningful insights and practical knowledge.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                        Connect With Me
                    </Typography>
                    <Typography variant="body1" paragraph>
                        I love connecting with readers! Feel free to reach out through the contact form or follow me on social media.
                        Your feedback and engagement mean the world to me.
                    </Typography>
                </Paper>
            </Container>
        </PageLayout>
    );
};

export default About; 