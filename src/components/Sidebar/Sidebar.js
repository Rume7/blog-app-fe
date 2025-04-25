// src/components/Sidebar/Sidebar.js
import React, { useState, useEffect } from 'react';
import { 
    List, 
    ListItem, 
    ListItemText, 
    Typography, 
    Paper, 
    Divider, 
    CircularProgress,
    Box 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchRecentPosts = async () => {
            try {
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://localhost:8080/api/v1/blog/recent?number=4', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setPosts(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching recent posts:', err);
                if (err.message === 'No token found') {
                    setError('Please sign in to view recent posts');
                } else {
                    setError(err.response?.data?.message || 'Failed to load recent posts');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user && token) {
            fetchRecentPosts();
        } else {
            setLoading(false);
            setError('Please sign in to view recent posts');
        }
    }, [user, token]);

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Latest Posts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : error ? (
                <Typography variant="body2" color="error" sx={{ p: 2 }}>
                    {error}
                </Typography>
            ) : (
                <List>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <React.Fragment key={post.id}>
                                <ListItem 
                                    button 
                                    component={RouterLink}
                                    to={`/blog/${post.id}`}
                                    sx={{ 
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={post.title}
                                        secondary={new Date(post.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        primaryTypographyProps={{
                                            variant: 'subtitle2',
                                            sx: { fontWeight: 'medium' }
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            color: 'text.secondary'
                                        }}
                                    />
                                </ListItem>
                                {index < posts.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No posts available
                        </Typography>
                    )}
                </List>
            )}
        </Paper>
    );
};

export default Sidebar;
