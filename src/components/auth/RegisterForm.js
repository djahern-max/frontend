// src/components/auth/RegisterForm.js
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

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simple validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await api.auth.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // Registration successful, redirect to login
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.detail || 'Failed to register. Please try again.');
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
                    Create an Account
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
                        value={formData.username}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
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
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </Box>

                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                    <Divider>
                        <Typography variant="body2" color="text.secondary">
                            or register with
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
                        Already have an account?{' '}
                        <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                            Login
                        </RouterLink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterForm;