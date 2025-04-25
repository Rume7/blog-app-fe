import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Divider,
    Avatar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Comment = ({ postId, onAddComment }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [hasCommented, setHasCommented] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (comment.trim() && !hasCommented) {
            onAddComment({
                id: Date.now(),
                content: comment,
                author: user.username || user.email,
                date: new Date().toISOString()
            });
            setComment('');
            setHasCommented(true);
        }
    };

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Comments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {user ? (
                !hasCommented ? (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar sx={{ mr: 2 }}>
                                {user.username?.[0] || user.email?.[0]}
                            </Avatar>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your comment..."
                                variant="outlined"
                            />
                        </Box>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={!comment.trim()}
                        >
                            Add Comment
                        </Button>
                    </Box>
                ) : (
                    <Typography color="text.secondary">
                        Thanks for your comment.
                    </Typography>
                )
            ) : (
                <Typography color="text.secondary">
                    Login to leave a comment.
                </Typography>
            )}
        </Paper>
    );
};

export default Comment; 