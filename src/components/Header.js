import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Avatar,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemButton
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    TableChart as TableIcon,
    MonetizationOn as ExpensesIcon,
    People as StaffIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
// Import the logo
import logoImage from '../images/Logo.png';
import api from '../api/apiService';

const Header = ({ currentPage, onPageChange }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [user, setUser] = useState(null);

    // Check if user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');

            if (token) {
                try {
                    // Set the token in the API service
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/api/auth/me');
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to get user info:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('tokenType');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleLogin = () => {
        navigate('/login');
        handleUserMenuClose();
    };

    const handleRegister = () => {
        navigate('/register');
        handleUserMenuClose();
    };

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);

        // Redirect to login page
        navigate('/login');
        handleUserMenuClose();
    };

    const handlePageChange = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
        setMobileOpen(false);
    };

    const goToDashboard = () => {
        handlePageChange('dashboard');
    };

    const pages = [
        { name: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
        { name: 'Tables', icon: <TableIcon />, value: 'tables' },
        { name: 'Expenses', icon: <ExpensesIcon />, value: 'expenses' },
        { name: 'Staff', icon: <StaffIcon />, value: 'staff' },
        { name: 'Settings', icon: <SettingsIcon />, value: 'settings' }
    ];


    const drawer = (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                <Box
                    component="img"
                    src={logoImage}
                    alt="GrowthCanvas Logo"
                    sx={{
                        height: 40,
                        cursor: 'pointer',
                        ml: 1
                    }}
                    onClick={goToDashboard}
                />
                <IconButton onClick={handleDrawerToggle}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {pages.map((page) => (
                    <ListItemButton
                        key={page.value}
                        selected={currentPage === page.value}
                        onClick={() => handlePageChange(page.value)}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(63, 81, 181, 0.12)',
                                '&:hover': {
                                    backgroundColor: 'rgba(63, 81, 181, 0.16)',
                                }
                            }
                        }}
                    >
                        <ListItemIcon sx={{
                            color: currentPage === page.value ? 'primary.main' : 'inherit'
                        }}>
                            {page.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={page.name}
                            primaryTypographyProps={{
                                fontWeight: currentPage === page.value ? 600 : 400,
                                color: currentPage === page.value ? 'primary.main' : 'inherit',
                                component: "span"
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List>
                {isAuthenticated ? (
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                component: "span"
                            }}
                        />
                    </ListItemButton>
                ) : (
                    <ListItemButton onClick={handleLogin}>
                        <ListItemIcon>
                            <LoginIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Login / Register"
                            primaryTypographyProps={{
                                component: "span"
                            }}
                        />
                    </ListItemButton>
                )}
            </List>
        </Box>
    );


    return (
        <>
            <AppBar
                position="sticky"
                color="primary"
                elevation={0}
                sx={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box
                        component="img"
                        src={logoImage}
                        alt="GrowthCanvas Logo"
                        sx={{
                            height: 40,
                            cursor: 'pointer',
                            mr: 2
                        }}
                        onClick={goToDashboard}
                    />

                    {!isMobile && (
                        <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.value}
                                    onClick={() => handlePageChange(page.value)}
                                    sx={{
                                        mx: 1,
                                        color: 'white',
                                        fontWeight: currentPage === page.value ? 600 : 400,
                                        borderBottom: currentPage === page.value ? '2px solid' : '2px solid transparent',
                                        borderColor: currentPage === page.value ? 'white' : 'transparent',
                                        borderRadius: 0,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderBottom: '2px solid',
                                            borderColor: currentPage === page.value ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                        }
                                    }}
                                    startIcon={page.icon}
                                >
                                    {page.name}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ ml: 'auto' }}>
                        {isAuthenticated ? (
                            <Button
                                variant="outlined"
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    borderRadius: '20px',
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={handleUserMenuOpen}
                                startIcon={<LoginIcon />}
                                sx={{
                                    borderRadius: '20px',
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Login
                            </Button>
                        )}
                        <Menu
                            anchorEl={userMenuAnchor}
                            open={Boolean(userMenuAnchor)}
                            onClose={handleUserMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            {isAuthenticated ? (
                                [
                                    <MenuItem key="profile" onClick={handleUserMenuClose} disabled>
                                        <ListItemIcon>
                                            <AccountIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2" component="span">
                                            {user ? user.username : 'Profile'}
                                        </Typography>
                                    </MenuItem>,
                                    <Divider key="divider" />,
                                    <MenuItem key="logout" onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2" component="span">
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                ]
                            ) : (
                                [
                                    <MenuItem key="login" onClick={handleLogin}>
                                        <ListItemIcon>
                                            <LoginIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2" component="span">
                                            Login
                                        </Typography>
                                    </MenuItem>,
                                    <MenuItem key="register" onClick={handleRegister}>
                                        <ListItemIcon>
                                            <AccountIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2" component="span">
                                            Register
                                        </Typography>
                                    </MenuItem>
                                ]
                            )}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Header;