import React, { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const topics = [
        { name: 'Technology', path: '/topics/technology' },
        { name: 'Personal Development', path: '/topics/personal-development' },
        { name: 'Creative Writing', path: '/topics/creative-writing' },
        { name: 'Travel', path: '/topics/travel' }
    ];

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    component={RouterLink}
                    to="/"
                    sx={{ mr: 2 }}
                >
                    <HomeIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Snapp
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        color="inherit"
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDownIcon />}
                    >
                        Topics
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        {topics.map((topic) => (
                            <MenuItem
                                key={topic.path}
                                component={RouterLink}
                                to={topic.path}
                                onClick={handleClose}
                            >
                                {topic.name}
                            </MenuItem>
                        ))}
                    </Menu>
                    {user?.role === 'ADMIN' && (
                        <IconButton
                            color="inherit"
                            component={RouterLink}
                            to="/admin/create-post"
                            title="Admin Panel"
                        >
                            <AdminPanelSettingsIcon />
                        </IconButton>
                    )}
                    {user ? (
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">
                                Sign In
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/register">
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 