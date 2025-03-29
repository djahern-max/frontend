// src/components/auth/PrivateRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import api from '../../api/apiService';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Verify token by making a request to the user info endpoint
                // Set Authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await api.get('/api/auth/me'); // Assume this is the correct endpoint
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Auth check failed:', error);
                // If the request fails, the token is invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('tokenType');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading indicator while checking
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Verifying your session...
                </Typography>
            </Box>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the children or outlet
    return children || <Outlet />;
};

export default PrivateRoute;