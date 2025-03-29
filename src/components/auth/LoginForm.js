// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Divider,
    Container,
    Alert,
    Grid
} from '@mui/material';
import api from '../../api/apiService';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // FormData is required for OAuth2PasswordRequestForm in FastAPI
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.auth.login(username, password);

            // Store tokens in localStorage
            localStorage.setItem('accessToken', response.data.access_token);
            localStorage.setItem('tokenType', response.data.token_type || 'Bearer');
            if (response.data.refresh_token) {
                localStorage.setItem('refreshToken', response.data.refresh_token);
            }

            // Set the token in the API service
            api.defaults.headers.common['Authorization'] =
                `${response.data.token_type || 'Bearer'} ${response.data.access_token}`;

            // Redirect to dashboard
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        window.location.href = `/api/auth/login/${provider}`;
    };

    return (
        <Container maxWidth="xs" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 1
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    Login to GrowthCanvas
                </Typography>

                {error && <Alert severity="error">
                    {typeof error === 'object'
                        ? (error.msg || error.detail || JSON.stringify(error))
                        : error}
                </Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            mt: 1,
                            mb: 2,
                            py: 1.2,
                            borderRadius: 0.5
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </Box>

                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                    <Divider>
                        <Typography variant="body2" color="text.secondary">
                            or login with
                        </Typography>
                    </Divider>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 0.5,
                                textTransform: 'none'
                            }}
                        >
                            Google
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 0.5,
                                textTransform: 'none'
                            }}
                        >
                            GitHub
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => handleOAuthLogin('linkedin')}
                            disabled={isLoading}
                            sx={{
                                borderRadius: 0.5,
                                textTransform: 'none'
                            }}
                        >
                            LinkedIn
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <RouterLink to="/register" style={{ textDecoration: 'none' }}>
                            Register
                        </RouterLink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginForm;