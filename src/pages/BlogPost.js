import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Paper, 
    Box, 
    CircularProgress,
    Avatar,
    Divider,
    Alert,
    IconButton,
    Stack,
    SvgIcon,
    TextField,
    Button,
    List,
    ListItem
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Custom Clap Icon
const ClapIcon = (props) => (
    <SvgIcon {...props}>
        <path d="M20.22 4.95c-.25-.86-.77-1.64-1.62-2.19.85-.55 1.37-1.33 1.62-2.19-.25.86-.77 1.64-1.62 2.19.85.55 1.37 1.33 1.62 2.19M6.82 12.25c-.25-.86-.77-1.64-1.62-2.19.85-.55 1.37-1.33 1.62-2.19-.25.86-.77 1.64-1.62 2.19.85.55 1.37 1.33 1.62 2.19M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m-1.5 7.25c2.5 0 4.5-2 4.5-4.5 0-3.08-2.92-6.22-5.26-9.3l-1.24-1.7-1.24 1.7C6.92 8.53 4 11.67 4 14.75c0 2.5 2 4.5 4.5 4.5.86 0 1.71-.23 2.5-.69.79.46 1.64.69 2.5.69"/>
    </SvgIcon>
);

const BlogPost = () => {
    const { id } = useParams();
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState(null);
    const { token, user } = useAuth();
    const queryClient = useQueryClient();
    const [hasClapped, setHasClapped] = useState(false);

    // Fetch post data using React Query
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const headers = token ? {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            const response = await axios.get(`http://localhost:8080/api/v1/blog/${id}`, {
                headers
            });
            // Check if user has clapped
            if (user && response.data.claps?.includes(user.username)) {
                setHasClapped(true);
            }
            return response.data;
        }
    });

    // Mutation for toggling clap
    const toggleClapMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(
                `http://localhost:8080/api/v1/blog/${id}/clap`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        },
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['post', id] });

            // Snapshot the previous value
            const previousPost = queryClient.getQueryData(['post', id]);

            // Optimistically update to the new value
            queryClient.setQueryData(['post', id], (old) => ({
                ...old,
                clapCount: hasClapped ? old.clapCount - 1 : old.clapCount + 1,
                claps: hasClapped 
                    ? old.claps.filter(username => username !== user.username)
                    : [...(old.claps || []), user.username]
            }));

            // Toggle local state
            setHasClapped(!hasClapped);

            return { previousPost };
        },
        onError: (err, newComment, context) => {
            // Revert back to the previous value on error
            queryClient.setQueryData(['post', id], context.previousPost);
            setHasClapped(!hasClapped);
        },
        onSettled: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        }
    });

    const handleClap = () => {
        if (!user) {
            setCommentError('Please sign in to clap for this post');
            return;
        }
        toggleClapMutation.mutate();
    };

    // Mutation for adding a comment
    const addCommentMutation = useMutation({
        mutationFn: async (newComment) => {
            const response = await axios.post(
                `http://localhost:8080/api/v1/comment/${id}/comments`,
                {
                    content: newComment,
                    postId: id,
                    author: user.username
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        },
        onMutate: async (newComment) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['post', id] });

            // Snapshot the previous value
            const previousPost = queryClient.getQueryData(['post', id]);

            // Optimistically update to the new value
            queryClient.setQueryData(['post', id], (old) => ({
                ...old,
                comments: [
                    ...(old.comments || []),
                    {
                        id: Date.now(), // temporary ID
                        content: newComment,
                        author: user.username,
                        createdAt: new Date().toISOString()
                    }
                ]
            }));

            return { previousPost };
        },
        onError: (err, newComment, context) => {
            // Revert back to the previous value on error
            queryClient.setQueryData(['post', id], context.previousPost);
            setCommentError(err.response?.data?.message || 'Failed to post comment');
        },
        onSettled: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['post', id] });
        }
    });

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        // Check if user has already commented
        const hasCommented = post?.comments?.some(comment => comment.author === user.username);
        if (hasCommented) {
            setCommentError('You have commented on this post.');
            return;
        }

        try {
            await addCommentMutation.mutateAsync(comment);
            setComment('');
            setCommentError(null);
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    const getAuthorName = (post) => {
        return post.author?.fullName || post.authorName || post.author?.name || post.author?.username || 'Unknown Author';
    };

    const getAuthorInitial = (post) => {
        const name = getAuthorName(post);
        return name[0]?.toUpperCase() || 'A';
    };

    if (isLoading) {
        return (
            <Paper elevation={1} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={1} sx={{ p: 2 }}>
                <Alert severity="error">
                    {error.message || 'Failed to load post'}
                </Alert>
            </Paper>
        );
    }

    if (!post) {
        return (
            <Paper elevation={1} sx={{ p: 2 }}>
                <Alert severity="info">
                    Post not found
                </Alert>
            </Paper>
        );
    }

    const hasUserCommented = post?.comments?.some(comment => comment.author === user?.username);

    return (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold',
                        fontSize: {
                            xs: '1.35rem',    // smaller on mobile
                            sm: '1.5rem'    // slightly larger on desktop
                        }
                    }}
                >
                    {post.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getAuthorInitial(post)}
                    </Avatar>
                    <Typography variant="subtitle1" color="text.secondary">
                        By {getAuthorName(post)} • {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                    </Typography>
                </Box>
            </Box>
            
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                py: 1,
                mb: 1
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'primary.main'
                            }
                        }}
                        onClick={handleClap}
                    >
                        <ClapIcon 
                            color={hasClapped ? "primary" : "action"} 
                            fontSize="small" 
                        />
                        <Typography 
                            variant="body2" 
                            color={hasClapped ? "primary" : "text.secondary"}
                        >
                            {post?.clapCount || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            💬
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {post.comments?.length || 18}
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <IconButton size="small">
                        <BookmarkBorderIcon />
                    </IconButton>
                    <IconButton size="small">
                        <ShareIcon />
                    </IconButton>
                    <IconButton size="small">
                        <MoreHorizIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" component="div" sx={{ 
                whiteSpace: 'pre-wrap',
                '& p': { mb: 2 },
                lineHeight: 1.8,
                fontSize: '1.1rem'
            }}>
                {post.content}
            </Typography>

            <Divider sx={{ my: 4 }} />
            
            {/* Comments Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Comments ({post?.comments?.length || 0})
                </Typography>
                {post?.comments?.length > 0 ? (
                    <Stack spacing={2}>
                        {[...post.comments]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((comment) => (
                            <Paper 
                                key={comment.id} 
                                elevation={0} 
                                sx={{ 
                                    p: 2, 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Avatar 
                                        sx={{ width: 32, height: 32 }}
                                        src={comment.author?.profilePicture}
                                    >
                                        {comment.author?.username?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            mb: 0.5 
                                        }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {comment?.author}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </Box>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            {comment.content}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No comments yet. Be the first to comment!
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default BlogPost; 