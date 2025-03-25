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
    Tooltip,
    Divider,
    Paper
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import DeleteIcon from '@mui/icons-material/Delete';
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
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Forecast Scenarios</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                >
                    New Scenario
                </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List sx={{ maxHeight: '250px', overflow: 'auto' }}>
                {loading ? (
                    <ListItem>
                        <ListItemText primary="Loading scenarios..." />
                    </ListItem>
                ) : scenarios.length === 0 ? (
                    <ListItem>
                        <ListItemText primary="No scenarios found" />
                    </ListItem>
                ) : (
                    scenarios.map((scenario) => (
                        <ListItem
                            key={scenario.id}
                            selected={selectedScenario && selectedScenario.id === scenario.id}
                            secondaryAction={
                                <IconButton edge="end" onClick={(e) => handleOpenMenu(e, scenario)}>
                                    <MoreVertIcon />
                                </IconButton>
                            }
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                borderRadius: 1
                            }}
                            onClick={() => handleSelectScenario(scenario)}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {scenario.is_default ? (
                                            <Tooltip title="Default Scenario">
                                                <StarIcon sx={{ mr: 1, color: 'gold' }} fontSize="small" />
                                            </Tooltip>
                                        ) : (
                                            <Box sx={{ width: 24, mr: 1 }} /> // Empty space to align items
                                        )}
                                        {scenario.name}
                                    </Box>
                                }
                                secondary={scenario.description}
                            />
                        </ListItem>
                    ))
                )}
            </List>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleOpenEditDialog}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Edit Scenario
                    </Box>
                </MenuItem>
                <MenuItem onClick={handleOpenDuplicateDialog}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FileCopyIcon fontSize="small" sx={{ mr: 1 }} />
                        Duplicate
                    </Box>
                </MenuItem>
                {!selectedScenario?.is_default && (
                    <MenuItem onClick={handleSetDefault}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                            Set as Default
                        </Box>
                    </MenuItem>
                )}
                <Divider />
                {!selectedScenario?.is_default && (
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                            Delete
                        </Box>
                    </MenuItem>
                )}
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialogMode === 'create' ? 'Create New Scenario' :
                        dialogMode === 'duplicate' ? 'Duplicate Scenario' :
                            'Edit Scenario'}
                </DialogTitle>
                <DialogContent>
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
                        sx={{ mb: 2 }}
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
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={handleDialogSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!dialogData.name.trim()}
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
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ScenarioManager;