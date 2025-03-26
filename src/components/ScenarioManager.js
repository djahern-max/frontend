import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    Divider,
    Paper,
    Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
// Try this import path instead
import bootIcon from '../images/boot.png';

import {
    getScenarios,
    createScenario,
    updateScenario,
    deleteScenario
} from '../api/financialService';

const ScenarioManager = ({ currentScenarioId, onScenarioChange }) => {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [dialogData, setDialogData] = useState({ name: '', description: '' });
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch scenarios on component mount
    useEffect(() => {
        fetchScenarios();
    }, []);

    // Set current scenario when scenarios are loaded or when currentScenarioId changes
    useEffect(() => {
        if (scenarios.length > 0 && currentScenarioId) {
            const currentScenario = scenarios.find(s => s.id === currentScenarioId);
            setSelectedScenario(currentScenario || scenarios.find(s => s.is_default) || scenarios[0]);
        } else if (scenarios.length > 0) {
            setSelectedScenario(scenarios.find(s => s.is_default) || scenarios[0]);
        }
    }, [scenarios, currentScenarioId]);

    // Notify parent component when selected scenario changes
    useEffect(() => {
        if (selectedScenario && onScenarioChange) {
            onScenarioChange(selectedScenario.id);
        }
    }, [selectedScenario, onScenarioChange]);

    const fetchScenarios = async () => {
        setLoading(true);
        try {
            const data = await getScenarios();
            setScenarios(data);
        } catch (error) {
            console.error('Error fetching scenarios:', error);
            showNotification('Failed to load scenarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMenu = (event, scenario) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedScenario(scenario);
    };

    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
    };

    const handleOpenCreateDialog = () => {
        setDialogMode('create');
        setDialogData({ name: '', description: '' });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = () => {
        setDialogMode('edit');
        setDialogData({
            name: selectedScenario.name,
            description: selectedScenario.description || ''
        });
        setOpenDialog(true);
        handleCloseMenu();
    };

    const handleOpenDuplicateDialog = () => {
        setDialogMode('duplicate');
        setDialogData({
            name: `${selectedScenario.name} (Copy)`,
            description: selectedScenario.description || ''
        });
        setOpenDialog(true);
        handleCloseMenu();
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleDialogInputChange = (e) => {
        const { name, value } = e.target;
        setDialogData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDialogSubmit = async () => {
        try {
            if (dialogMode === 'create' || dialogMode === 'duplicate') {
                await createScenario(dialogData);
                showNotification('Scenario created successfully');
            } else if (dialogMode === 'edit') {
                await updateScenario(selectedScenario.id, dialogData);
                showNotification('Scenario updated successfully');
            }

            setOpenDialog(false);
            fetchScenarios();
        } catch (error) {
            console.error('Error saving scenario:', error);
            showNotification('Failed to save scenario', 'error');
        }
    };

    const handleSetDefault = async () => {
        try {
            await updateScenario(selectedScenario.id, { is_default: true });
            showNotification('Default scenario updated');
            fetchScenarios();
        } catch (error) {
            console.error('Error setting default scenario:', error);
            showNotification('Failed to set default scenario', 'error');
        }
        handleCloseMenu();
    };

    const handleDelete = async () => {
        try {
            await deleteScenario(selectedScenario.id);
            showNotification('Scenario deleted successfully');
            fetchScenarios();
        } catch (error) {
            console.error('Error deleting scenario:', error);
            showNotification('Failed to delete scenario', 'error');
        }
        handleCloseMenu();
    };

    const handleSelectScenario = (scenario) => {
        setSelectedScenario(scenario);
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({
            ...prev,
            open: false
        }));
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5
            }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        position: 'relative'
                    }}
                >
                    Forecast Scenarios
                    <Box
                        sx={{
                            position: 'absolute',
                            height: '3px',
                            width: '40px',
                            backgroundColor: 'primary.main',
                            bottom: '-8px',
                            left: 0,
                            borderRadius: '2px'
                        }}
                    />
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        padding: '8px 16px',
                        boxShadow: '0 2px 8px rgba(63, 81, 181, 0.25)',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.35)',
                        }
                    }}
                >
                    New Scenario
                </Button>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <List sx={{ maxHeight: '300px', overflow: 'auto', px: 1 }}>
                {loading ? (
                    <ListItem>
                        <ListItemText primary="Loading scenarios..." />
                    </ListItem>
                ) : scenarios.length === 0 ? (
                    <ListItem>
                        <ListItemText primary="No scenarios found" />
                    </ListItem>
                ) : (
                    scenarios.map((scenario) => {
                        const isSelected = selectedScenario && selectedScenario.id === scenario.id;
                        return (
                            <ListItem
                                key={scenario.id}
                                selected={isSelected}
                                secondaryAction={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {isSelected && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'primary.main',
                                                    fontWeight: 600,
                                                    mr: 1,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <CheckCircleIcon
                                                    sx={{
                                                        fontSize: '16px',
                                                        mr: 0.5
                                                    }}
                                                />
                                                Active
                                            </Typography>
                                        )}
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => handleOpenMenu(e, scenario)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                    color: 'text.primary'
                                                }
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                }
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(63, 81, 181, 0.12)',
                                        borderLeft: '4px solid #3f51b5',
                                        '&:hover': {
                                            backgroundColor: 'rgba(63, 81, 181, 0.16)',
                                        }
                                    },
                                    borderRadius: '8px',
                                    mb: 1,
                                    transition: 'all 0.2s ease',
                                    border: isSelected
                                        ? '1px solid rgba(63, 81, 181, 0.5)'
                                        : '1px solid transparent',
                                    boxShadow: isSelected
                                        ? '0 2px 8px rgba(63, 81, 181, 0.15)'
                                        : 'none',
                                }}
                                onClick={() => handleSelectScenario(scenario)}
                            >
                                {/* Avatar with first letter of scenario name */}
                                <Avatar
                                    sx={{
                                        bgcolor: isSelected ? '#3f51b5' :
                                            scenario.name.toLowerCase().includes('aggressive') ? '#e91e63' :
                                                scenario.name.toLowerCase().includes('modest') ? '#ff9800' :
                                                    '#00a152',
                                        mr: 2,
                                        width: 36,
                                        height: 36,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        border: isSelected ? '2px solid #3f51b5' : 'none',
                                        boxShadow: isSelected ? '0 0 0 2px rgba(63, 81, 181, 0.2)' : 'none'
                                    }}
                                >
                                    {scenario.name.toLowerCase().includes('bootstrap') ? (
                                        <img src={bootIcon} alt="Boot" style={{ width: '24px', height: '24px' }} />
                                    ) : scenario.name.toLowerCase().includes('modest') ? (
                                        <TrendingUpIcon sx={{ fontSize: '20px' }} />
                                    ) : scenario.name.toLowerCase().includes('aggressive') ? (
                                        <RocketLaunchIcon sx={{ fontSize: '20px' }} />
                                    ) : (
                                        `S${scenario.name.match(/\d+/) ? scenario.name.match(/\d+/)[0] : '1'}`
                                    )}
                                </Avatar>

                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: isSelected ? 600 : 500,
                                                    mr: 1,
                                                    color: isSelected ? 'primary.main' : 'text.primary',
                                                }}
                                            >
                                                {scenario.name}
                                            </Typography>
                                            {scenario.is_default && (
                                                <StarIcon
                                                    sx={{
                                                        color: 'gold',
                                                        fontSize: '1.4rem',
                                                        filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            {scenario.description && (
                                                <Typography
                                                    variant="body2"
                                                    color={isSelected ? "primary.dark" : "text.secondary"}
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    {scenario.description}
                                                </Typography>
                                            )}
                                            {scenario.investment && (
                                                <Typography
                                                    variant="caption"
                                                    color={isSelected ? "primary.dark" : "text.secondary"}
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.5,
                                                        fontWeight: isSelected ? 500 : 400
                                                    }}
                                                >
                                                    {`${scenario.investment} Investment`}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        );
                    })
                )}
            </List>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        mt: 0.5,
                        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.15)',
                        borderRadius: '8px'
                    }
                }}
            >
                <MenuItem onClick={handleOpenEditDialog} sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body2">Edit Scenario</Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={handleOpenDuplicateDialog} sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileCopyIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body2">Duplicate</Typography>
                    </Box>
                </MenuItem>
                {!selectedScenario?.is_default && (
                    <MenuItem onClick={handleSetDefault} sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlineIcon fontSize="small" sx={{ mr: 1.5, color: '#FFB800' }} />
                            <Typography variant="body2">Set as Default</Typography>
                        </Box>
                    </MenuItem>
                )}
                <Divider />
                {!selectedScenario?.is_default && (
                    <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: 'error.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                            <Typography variant="body2">Delete</Typography>
                        </Box>
                    </MenuItem>
                )}
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: 'rgba(63, 81, 181, 0.05)',
                    py: 2.5
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {dialogMode === 'create' ? 'Create New Scenario' :
                            dialogMode === 'duplicate' ? 'Duplicate Scenario' :
                                'Edit Scenario'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Scenario Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={dialogData.name}
                        onChange={handleDialogInputChange}
                        sx={{ mb: 2.5 }}
                        InputProps={{
                            sx: {
                                borderRadius: '8px'
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description (optional)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={dialogData.description}
                        onChange={handleDialogInputChange}
                        multiline
                        rows={3}
                        InputProps={{
                            sx: {
                                borderRadius: '8px'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                }}>
                    <Button
                        onClick={handleDialogClose}
                        sx={{
                            textTransform: 'none',
                            color: 'text.secondary'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!dialogData.name.trim()}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3
                        }}
                    >
                        {dialogMode === 'create' || dialogMode === 'duplicate' ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ScenarioManager;