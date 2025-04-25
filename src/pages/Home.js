import React from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    TextField,
    Paper,
    Avatar,
    Stack,
    Alert,
    Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import SendIcon from '@mui/icons-material/Send';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Home = () => {
    const { token, user } = useAuth();
    const [email, setEmail] = React.useState('');
    const [newsletterSuccess, setNewsletterSuccess] = React.useState(false);
    const [emailError, setEmailError] = React.useState('');

    // Temporary featured posts data
    const temporaryFeaturedPosts = [
        {
            id: 1,
            title: "The Future of AI in Web Development",
            content: "Exploring how artificial intelligence is revolutionizing the way we build and interact with web applications. From automated code generation to intelligent user interfaces, AI is changing the game.",
            imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            authorName: "Sarah Chen",
            createdAt: "2024-03-15T10:00:00Z"
        },
        {
            id: 2,
            title: "Building Scalable Microservices with Node.js",
            content: "A comprehensive guide to designing and implementing microservices architecture using Node.js. Learn about service discovery, load balancing, and container orchestration.",
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            authorName: "Michael Johnson",
            createdAt: "2024-03-10T14:30:00Z"
        },
        {
            id: 3,
            title: "React 19: What's New and Exciting",
            content: "Dive into the latest features and improvements in React 19. From concurrent rendering to new hooks, discover how these updates will impact your development workflow.",
            imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            authorName: "David Kim",
            createdAt: "2024-03-05T09:15:00Z"
        }
    ];

    // Fetch featured posts
    const { data: featuredPosts = temporaryFeaturedPosts, isLoading: isLoadingFeatured } = useQuery({
        queryKey: ['featured-posts'],
        queryFn: async () => {
            const headers = token ? {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            const response = await axios.get('http://localhost:8080/api/v1/blog/featured', {
                headers
            });
            return response.data;
        }
    });

    // Fetch trending posts
    const { data: trendingPosts = [], isLoading: isLoadingTrending } = useQuery({
        queryKey: ['trending-posts'],
        queryFn: async () => {
            const headers = token ? {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            const response = await axios.get('http://localhost:8080/api/v1/blog/trending', {
                headers
            });
            return response.data;
        }
    });

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Here you would typically make an API call to subscribe the user
        setNewsletterSuccess(true);
        setEmail('');
        setEmailError('');
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError('');
    };

    if (isLoadingFeatured || isLoadingTrending) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Hero Section */}
            <Box sx={{ 
                position: 'relative',
                height: '64vh',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                mb: 8
            }}>
                <Container maxWidth="md">
                    <Typography 
                        variant="h1" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            mb: 2
                        }}
                    >
                        Tech Insights & Innovation
                    </Typography>
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            mb: 4,
                            fontSize: { xs: '1.25rem', md: '1.75rem' },
                            opacity: 0.9
                        }}
                    >
                        Exploring the latest in technology, development, and digital transformation
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button 
                            variant="contained" 
                            size="large"
                            component={RouterLink}
                            to="/blog"
                            sx={{ 
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                backgroundColor: '#2196F3',
                                '&:hover': {
                                    backgroundColor: '#1976D2'
                                }
                            }}
                        >
                            Read Articles
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="large"
                            component={RouterLink}
                            to="/about"
                            sx={{ 
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Learn More
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Featured Posts Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        gutterBottom 
                        sx={{ 
                            mb: 6,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '60px',
                                height: '4px',
                                backgroundColor: 'primary.main',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        Featured Posts
                    </Typography>
                    <Grid container spacing={4}>
                        {featuredPosts.map((post) => (
                            <Grid item xs={12} md={4} key={post.id}>
                                <Card 
                                    component={RouterLink} 
                                    to={`/blog/${post.id}`}
                                    sx={{ 
                                        height: '100%',
                                        textDecoration: 'none',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            transition: 'transform 0.3s ease',
                                            '& .MuiCardMedia-root': {
                                                transform: 'scale(1.05)',
                                                transition: 'transform 0.3s ease'
                                            },
                                            '& .featured-overlay': {
                                                opacity: 1,
                                                transition: 'opacity 0.3s ease'
                                            }
                                        }
                                    }}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="240"
                                            image={post.imageUrl || 'https://source.unsplash.com/random/800x600?tech'}
                                            alt={post.title}
                                            sx={{ 
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                        <Box 
                                            className="featured-overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                                                opacity: 0.7,
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                p: 2
                                            }}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                component="h3" 
                                                sx={{ 
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {post.title}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            paragraph
                                            sx={{ 
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {post.content}
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            mt: 'auto'
                                        }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32,
                                                    bgcolor: 'primary.main'
                                                }}
                                            >
                                                {post.authorName?.[0] || 'A'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" component="div">
                                                    {post.authorName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Newsletter Section */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" component="h2" gutterBottom>
                                Stay Updated
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Subscribe to our newsletter to receive the latest posts and updates directly in your inbox.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <form onSubmit={handleNewsletterSubmit}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder={emailError || "Enter your email"}
                                        value={email}
                                        onChange={handleEmailChange}
                                        sx={{ 
                                            backgroundColor: 'white',
                                            borderRadius: 1,
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'transparent',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'transparent',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'transparent',
                                                },
                                                '& input::placeholder': {
                                                    color: emailError ? '#f44336' : 'rgba(0, 0, 0, 0.6)',
                                                    opacity: 1
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        endIcon={<SendIcon />}
                                        sx={{ 
                                            px: 3,
                                            backgroundColor: 'white',
                                            color: '#2196F3',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            }
                                        }}
                                    >
                                        Subscribe
                                    </Button>
                                </Box>
                            </form>
                            {newsletterSuccess && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Thank you for subscribing to our newsletter!
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};

export default Home; 