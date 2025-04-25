import React from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    IconButton,
    Divider
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Divider sx={{ mb: 2 }} />
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} Blog App. All rights reserved.
                    </Typography>
                    <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                        <IconButton
                            component="a"
                            href="https://github.com/rume7"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                        >
                            <GitHubIcon />
                        </IconButton>
                        <IconButton
                            component="a"
                            href="https://twitter.com/rume"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                        >
                            <TwitterIcon />
                        </IconButton>
                        <IconButton
                            component="a"
                            href="https://linkedin.com/in/rhumedisi"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                        >
                            <LinkedInIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 