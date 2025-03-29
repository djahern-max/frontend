// src/components/auth/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get token from URL query parameters
                const urlParams = new URLSearchParams(location.search);
                const token = urlParams.get('token');

                if (!token) {
                    throw new Error('No token received from authentication provider');
                }

                // Store token in localStorage
                localStorage.setItem('accessToken', token);

                // Redirect to dashboard
                navigate('/dashboard');
            } catch (err) {
                console.error('Authentication callback error:', err);
                setError(err.message || 'Failed to complete authentication');
            } finally {
                setLoading(false);
            }
        };

        processCallback();
    }, [location, navigate]);

    if (loading) {
        return (
            <div className="auth-callback-container">
                <div className="loading-spinner"></div>
                <p>Completing authentication, please wait...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-callback-container">
                <div className="error-message">
                    <h3>Authentication Error</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')}>Return to Login</button>
                </div>
            </div>
        );
    }

    return null; // This should not be rendered as we navigate away
};

export default AuthCallback;