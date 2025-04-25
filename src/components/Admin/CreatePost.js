import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    TextField, 
    Button, 
    Box,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Divider,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import PageLayout from '../Layout/PageLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        authorFirstName: '',
        authorLastName: '',
        authorEmail: '',
        isDraft: false,
        id: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [showDrafts, setShowDrafts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'mine', 'shared'
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [selectedAdmins, setSelectedAdmins] = useState([]);
    const [currentUser, setCurrentUser] = useState({ username: '', email: '' });
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token');
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [retryCount, setRetryCount] = useState(3);
    const location = useLocation();
    const navigate = useNavigate();

    // Get current user info from token
    useEffect(() => {
        if (token) {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({
                    username: tokenPayload.username || tokenPayload.preferred_username,
                    email: tokenPayload.email
                });
            } catch (error) {
                console.error('Error parsing token:', error);
                setError('Failed to load user information');
            } finally {
                setIsLoadingUser(false);
            }
        }
    }, [token]);

    // Load draft data if provided in location state
    useEffect(() => {
        if (location.state?.draft) {
            const draft = location.state.draft;
            setFormData({
                title: draft.title || '',
                content: draft.content || '',
                authorFirstName: draft.author?.firstName || '',
                authorLastName: draft.author?.lastName || '',
                authorEmail: draft.author?.email || '',
                isDraft: true,
                id: draft.id // Store the draft ID for updating
            });
        }
    }, [location.state]);

    // Fetch drafts using React Query
    const { data: drafts = [], isLoading: isLoadingDrafts } = useQuery({
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

    // Fetch admins list with error handling
    const { data: adminList = [], isLoading: isLoadingAdmins, error: adminError, refetch: refetchAdmins } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:8080/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        },
        onError: (error) => {
            console.error('Error fetching users:', error);
            let errorMessage = 'Failed to load users list. ';
            
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        errorMessage += 'Please log in again.';
                        break;
                    case 403:
                        errorMessage += 'You do not have permission to view users.';
                        break;
                    case 404:
                        errorMessage += 'Users endpoint not found.';
                        break;
                    case 500:
                        errorMessage += 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage += 'Please try again later.';
                }
            } else if (error.request) {
                errorMessage += 'Network error. Please check your connection.';
            } else {
                errorMessage += 'An unexpected error occurred.';
            }
            
            setError(errorMessage);
            setRetryCount(prev => Math.max(0, prev - 1));
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Mutation for saving draft
    const saveDraftMutation = useMutation({
        mutationFn: async (draftData) => {
            const response = await axios.post(
                'http://localhost:8080/api/v1/blog/drafts',
                {
                    ...draftData,
                    author: {
                        firstName: draftData.authorFirstName,
                        lastName: draftData.authorLastName,
                        email: draftData.authorEmail
                    }
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
        onSuccess: () => {
            queryClient.invalidateQueries(['drafts']);
            setSuccess('Draft saved successfully!');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to save draft');
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
            setSuccess('Draft deleted successfully!');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to delete draft');
        }
    });

    // Mutation for publishing post
    const publishPostMutation = useMutation({
        mutationFn: async (postData) => {
            const response = await axios.post(
                'http://localhost:8080/api/v1/blog/create',
                {
                    ...postData,
                    author: {
                        firstName: postData.authorFirstName,
                        lastName: postData.authorLastName,
                        email: postData.authorEmail
                    }
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
        onSuccess: () => {
            queryClient.invalidateQueries(['drafts']);
            setSuccess('Post published successfully!');
            setFormData({
                title: '',
                content: '',
                authorFirstName: '',
                authorLastName: '',
                authorEmail: '',
                isDraft: false
            });
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to publish post');
        }
    });

    // Mutation for sharing draft
    const shareDraftMutation = useMutation({
        mutationFn: async ({ draftId, adminIds }) => {
            await axios.post(
                `http://localhost:8080/api/v1/blog/drafts/${draftId}/share`,
                { adminIds },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['drafts']);
            setSuccess('Draft shared successfully!');
            setShowShareDialog(false);
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Failed to share draft');
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e, isDraft = false) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (formData.id) {
                // Update existing draft
                await axios.put(
                    `http://localhost:8080/api/v1/blog/drafts/${formData.id}`,
                    {
                        ...formData,
                        author: {
                            firstName: formData.authorFirstName,
                            lastName: formData.authorLastName,
                            email: formData.authorEmail
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setSuccess('Draft updated successfully!');
            } else if (isDraft) {
                await saveDraftMutation.mutateAsync(formData);
            } else {
                await publishPostMutation.mutateAsync(formData);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const loadDraft = (draft) => {
        setFormData({
            ...draft,
            authorFirstName: draft.author.firstName,
            authorLastName: draft.author.lastName,
            authorEmail: draft.author.email,
            isDraft: true
        });
        setShowDrafts(false);
        setActiveTab(0);
    };

    const deleteDraft = async (draftId) => {
        try {
            await deleteDraftMutation.mutateAsync(draftId);
        } catch (err) {
            console.error('Error deleting draft:', err);
        }
    };

    const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleShareDraft = async () => {
        if (selectedDraft && selectedAdmins.length > 0) {
            await shareDraftMutation.mutateAsync({
                draftId: selectedDraft.id,
                adminIds: selectedAdmins
            });
        }
    };

    const filteredDrafts = drafts.filter(draft => {
        const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           draft.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterBy === 'all' ||
                           (filterBy === 'mine' && draft.createdBy === currentUser.username) ||
                           (filterBy === 'shared' && draft.sharedWith?.includes(currentUser.username));
        return matchesSearch && matchesFilter;
    });

    const renderForm = () => (
        <form onSubmit={(e) => handleSubmit(e, false)}>
            <TextField
                label="Title"
                name="title"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.title}
                onChange={handleChange}
                required
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                    label="Author First Name"
                    name="authorFirstName"
                    variant="outlined"
                    sx={{ flex: 1 }}
                    value={formData.authorFirstName}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Author Last Name"
                    name="authorLastName"
                    variant="outlined"
                    sx={{ flex: 1 }}
                    value={formData.authorLastName}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Author Email"
                    name="authorEmail"
                    variant="outlined"
                    sx={{ flex: 2 }}
                    value={formData.authorEmail}
                    onChange={handleChange}
                    required
                    type="email"
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <TextField
                    label="Content"
                    name="content"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={10}
                    value={formData.content}
                    onChange={handleChange}
                    required
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Word count: {wordCount}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Publish Post'}
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, true)}
                >
                    Save as Draft
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={() => setShowDrafts(true)}
                >
                    Load Draft
                </Button>
            </Box>
        </form>
    );

    const renderPreview = () => (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    {formData.title || 'Untitled Post'}
                </Typography>
                {formData.isDraft && (
                    <Chip 
                        label="Draft" 
                        color="warning" 
                    />
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    By {formData.authorFirstName} {formData.authorLastName}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 'auto' }}>
                    {new Date().toLocaleDateString('en-US', {
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
                {formData.content || 'No content yet'}
            </Typography>
        </Box>
    );

    return (
        <PageLayout>
            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {formData.id ? 'Edit Draft' : 'Create New Post'}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={() => navigate('/admin/drafts')}
                        >
                            Back to Drafts
                        </Button>
                    </Box>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="Edit" />
                            <Tab label="Preview" />
                        </Tabs>
                    </Box>

                    {activeTab === 0 ? renderForm() : renderPreview()}
                </Paper>
            </Container>

            {/* Drafts Dialog with enhanced features */}
            <Dialog 
                open={showDrafts} 
                onClose={() => setShowDrafts(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Saved Drafts</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {(isLoadingDrafts || isLoadingUser) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredDrafts.length > 0 ? (
                        <List>
                            {filteredDrafts.map((draft) => (
                                <ListItem
                                    key={draft.id}
                                    secondaryAction={
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Share with admins">
                                                <IconButton 
                                                    edge="end" 
                                                    onClick={() => {
                                                        setSelectedDraft(draft);
                                                        setShowShareDialog(true);
                                                    }}
                                                >
                                                    <ShareIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <IconButton 
                                                edge="end" 
                                                onClick={() => deleteDraft(draft.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    }
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
                                        onClick={() => loadDraft(draft)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary" align="center">
                            No drafts found
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDrafts(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Share Draft Dialog */}
            <Dialog
                open={showShareDialog}
                onClose={() => setShowShareDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Share Draft with Admins</DialogTitle>
                <DialogContent>
                    {isLoadingAdmins ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : adminError ? (
                        <Box sx={{ mt: 2 }}>
                            <Alert 
                                severity="error" 
                                action={
                                    <Button 
                                        color="inherit" 
                                        size="small"
                                        onClick={() => {
                                            setRetryCount(3);
                                            refetchAdmins();
                                        }}
                                        disabled={retryCount === 0}
                                    >
                                        {retryCount > 0 ? `Retry (${retryCount} left)` : 'No retries left'}
                                    </Button>
                                }
                            >
                                {error}
                            </Alert>
                        </Box>
                    ) : (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Admins</InputLabel>
                            <Select
                                multiple
                                value={selectedAdmins}
                                onChange={(e) => setSelectedAdmins(e.target.value)}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((adminId) => {
                                            const admin = adminList.find(a => a.id === adminId);
                                            return (
                                                <Chip
                                                    key={adminId}
                                                    label={admin?.username || adminId}
                                                    avatar={<Avatar>{admin?.username?.[0] || 'A'}</Avatar>}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {adminList.map((admin) => (
                                    <MenuItem key={admin.id} value={admin.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar>{admin.username?.[0]}</Avatar>
                                            <Box>
                                                <Typography>{admin.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {admin.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowShareDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleShareDraft}
                        variant="contained"
                        disabled={selectedAdmins.length === 0 || isLoadingAdmins || !!adminError}
                    >
                        Share
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
};

export default CreatePost; 