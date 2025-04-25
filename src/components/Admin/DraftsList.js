import React, { useState } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemSecondaryAction,
    IconButton,
    Box,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PageLayout from '../Layout/PageLayout';
import axios from 'axios';

const DraftsList = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'mine', 'shared'
    const [currentUser, setCurrentUser] = useState({ username: '', email: '' });
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');

    // Get current user info from token
    React.useEffect(() => {
        if (token) {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({
                    username: tokenPayload.username || tokenPayload.preferred_username,
                    email: tokenPayload.email
                });
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    }, [token]);

    // Fetch drafts using React Query
    const { data: drafts = [], isLoading, error } = useQuery({
        queryKey: ['drafts', filterBy, searchQuery],
        queryFn: async () => {
            const response = await axios.get('http://localhost:8080/api/v1/blog/drafts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    filter: filterBy,
                    search: searchQuery
                }
            });
            return response.data;
        }
    });

    // Mutation for deleting draft
    const deleteDraftMutation = useMutation({
        mutationFn: async (draftId) => {
            await axios.delete(`http://localhost:8080/api/v1/blog/drafts/${draftId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['drafts']);
        },
        onError: (error) => {
            console.error('Error deleting draft:', error);
        }
    });

    const handleDelete = async (draftId) => {
        if (window.confirm('Are you sure you want to delete this draft?')) {
            await deleteDraftMutation.mutateAsync(draftId);
        }
    };

    const handleEdit = (draft) => {
        navigate('/admin/create-post', { state: { draft } });
    };

    const filteredDrafts = drafts.filter(draft => {
        const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           draft.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterBy === 'all' ||
                           (filterBy === 'mine' && draft.createdBy === currentUser.username) ||
                           (filterBy === 'shared' && draft.sharedWith?.includes(currentUser.username));
        return matchesSearch && matchesFilter;
    });

    return (
        <PageLayout>
            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1">
                            Draft Posts
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => navigate('/admin/create-post')}
                        >
                            Create New Post
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error.message || 'Failed to load drafts'}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                            size="small"
                            placeholder="Search drafts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Filter By</InputLabel>
                            <Select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                                label="Filter By"
                            >
                                <MenuItem value="all">All Drafts</MenuItem>
                                <MenuItem value="mine">My Drafts</MenuItem>
                                <MenuItem value="shared">Shared with Me</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredDrafts.length > 0 ? (
                        <List>
                            {filteredDrafts.map((draft) => (
                                <ListItem
                                    key={draft.id}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {draft.title || 'Untitled Draft'}
                                                </Typography>
                                                {draft.sharedWith?.length > 0 && (
                                                    <Chip 
                                                        size="small" 
                                                        label={`Shared with ${draft.sharedWith.length} admin${draft.sharedWith.length > 1 ? 's' : ''}`}
                                                        color="primary"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                        {draft.createdBy?.[0]?.toUpperCase() || 'A'}
                                                    </Avatar>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Created by: {draft.createdBy}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Last modified: {new Date(draft.lastModified).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton 
                                            edge="end" 
                                            onClick={() => handleEdit(draft)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            edge="end" 
                                            onClick={() => handleDelete(draft.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary" align="center">
                            No drafts found
                        </Typography>
                    )}
                </Paper>
            </Container>
        </PageLayout>
    );
};

export default DraftsList; 