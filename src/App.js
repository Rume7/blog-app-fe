// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import About from './components/About/About';
import Topics from './components/Topics/Topics';
import CreatePost from './components/Admin/CreatePost';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import DraftsList from './components/Admin/DraftsList';

const theme = createTheme({
   palette: {
       primary: {
           main: '#3f51b5',
       },
       secondary: {
           main: '#f50057',
       },
   },
   typography: {
       fontFamily: [
           '-apple-system',
           'BlinkMacSystemFont',
           '"Segoe UI"',
           'Roboto',
           '"Helvetica Neue"',
           'Arial',
           'sans-serif',
           '"Apple Color Emoji"',
           '"Segoe UI Emoji"',
           '"Segoe UI Symbol"',
       ].join(','),
   },
});

const mockPost = {
    id: 1,
    title: "The Future of Web Development",
    authorName: "John Doe",
    date: "2024-03-15",
    content: `Web development continues to evolve at a rapid pace, with new technologies and frameworks emerging regularly. The rise of serverless architecture, progressive web apps, and the increasing importance of web performance are shaping the future of the industry.

One of the most significant trends is the growing adoption of JavaScript frameworks like React, Vue, and Angular. These frameworks have revolutionized how we build user interfaces, making it easier to create complex, interactive web applications.

Another important development is the focus on web accessibility and inclusive design. As the web becomes more integral to our daily lives, ensuring that websites are usable by everyone, regardless of their abilities, is becoming increasingly important.

The future of web development is exciting, with new tools and technologies constantly emerging. Staying up-to-date with these developments is crucial for any web developer looking to remain competitive in the industry.`
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

// Create a client
const queryClient = new QueryClient();

const App = () => (
    <ErrorBoundary>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <Router>
                        <React.Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                <Route path="/" element={<Layout><Home /></Layout>} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/topics" element={<Topics />} />
                                <Route path="/blog/:id" element={<Layout><BlogPost /></Layout>} />
                                <Route 
                                    path="/admin/create-post" 
                                    element={
                                        <ProtectedRoute>
                                            <CreatePost />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route
                                    path="/admin/drafts"
                                    element={
                                        <ProtectedRoute>
                                            <DraftsList />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="profile"
                                    element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    }
                                />
                            </Routes>
                        </React.Suspense>
                    </Router>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </ErrorBoundary>
);

export default App;
