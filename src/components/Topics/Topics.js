import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box } from '@mui/material';
import PageLayout from '../Layout/PageLayout';

const Topics = () => {
    const { topicId } = useParams();
    const topicName = topicId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return (
        <PageLayout>
            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {topicName} Posts
                    </Typography>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body1" paragraph>
                            Coming soon: A collection of posts about {topicName.toLowerCase()}.
                            Check back later for insightful articles and discussions on this topic.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </PageLayout>
    );
};

export default Topics; 