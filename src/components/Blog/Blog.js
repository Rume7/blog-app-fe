// src/components/Blog/Blog.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, Divider, Box } from '@mui/material';
import Comment from './Comment';

const BlogPost = ({ post = {} }) => {
    const { 
        title = 'Untitled Post', 
        authorName = 'Unknown Author', 
        date = new Date().toISOString(), 
        content = '' 
    } = post;

    const [comments, setComments] = useState([]);

    const handleAddComment = (newComment) => {
        setComments([...comments, newComment]);
    };

    return (
        <Card sx={{ mb: 4 }}>
            <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        By {authorName}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 'auto' }}>
                        {new Date(date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography 
                    variant="body1" 
                    sx={{ 
                        textAlign: 'justify',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line'
                    }}
                >
                    {content}
                </Typography>
                <Comment postId={post.id} onAddComment={handleAddComment} />
            </CardContent>
        </Card>
    );
};

export default BlogPost;
