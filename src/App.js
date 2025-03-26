import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  IconButton,

} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


// Components
import Dashboard from './components/Dashboard';
import FinancialChart from './components/FinancialChart';
import FinancialTable from './components/FinancialTable';
import RyzeParametersForm from './components/RyzeParametersForm';
import StaffSummaryTable from './components/StaffSummaryTable';
import ExpenseBreakdownChart from './components/ExpenseBreakdownChart';
import ScenarioManager from './components/ScenarioManager';

// API Services
import {
  getScenarioYearlyFinancials,
  getScenarioStaffSummary,
  getScenarioExpenseBreakdown
} from './api/financialService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [financialData, setFinancialData] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [currentScenarioId, setCurrentScenarioId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (currentScenarioId) {
      fetchScenarioData();
    }
  }, [currentScenarioId]);
  const fetchScenarioData = async () => {
    setDataLoading(true);
    try {
      // Clear existing data
      setFinancialData(null);
      setStaffData(null);

      console.log("Fetching data for scenario ID:", currentScenarioId);

      // Fetch both data sources simultaneously
      const [financials, staff] = await Promise.all([
        getScenarioYearlyFinancials(currentScenarioId),
        getScenarioStaffSummary(currentScenarioId)
      ]);

      console.log("Data received:", { financials, staff });

      // Set both pieces of data
      setFinancialData(financials);
      setStaffData(staff);
    } catch (error) {
      console.error('Error fetching scenario data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleScenarioChange = (scenarioId) => {
    console.log("Scenario selected:", scenarioId);
    setCurrentScenarioId(scenarioId);
  };

  const handleParametersUpdated = (updatedData) => {
    // Update the financial data after parameters change
    if (updatedData) {
      setFinancialData(updatedData);
    }
    // Refresh all data
    fetchScenarioData();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          position="static"
          sx={{
            background: 'linear-gradient(90deg, #3f51b5 0%, #303f9f 100%)',
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          }}
        >
          <Toolbar>
            <Typography variant="h6" color="inherit" sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              RYZE.ai Financial Planner
            </Typography>
            {/* Add user profile or settings icon */}
            <IconButton color="inherit" size="large">
              <AccountCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <ScenarioManager
            currentScenarioId={currentScenarioId}
            onScenarioChange={handleScenarioChange}
          />

          {currentScenarioId && (
            <>




              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile

                sx={{
                  mb: 3,
                  borderRadius: '8px',
                  background: 'rgba(245, 247, 250, 0.8)', // Light gray background
                  padding: '4px',
                  '& .MuiTabs-flexContainer': {
                    justifyContent: 'center', // Centers the tabs
                  },
                  '& .MuiTabs-indicator': {
                    height: '3px', // Thicker indicator
                    borderRadius: '3px',
                  },
                  '& .MuiTab-root': {
                    minWidth: { xs: '80px', sm: 'auto' },
                    textTransform: 'none', // No all caps
                    fontWeight: 500,
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    padding: { xs: '8px 10px', sm: '10px 16px' },
                    '&.Mui-selected': {
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.8)', // Light background for selected tab
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                    }
                  },
                  // Ensure scroll buttons are visible when needed but don't interfere with centering
                  '& .MuiTabs-scrollButtons': {
                    opacity: 1,
                  }
                }}
              >
                <Tab icon={<BarChartIcon />} label="Dashboard" />
                <Tab icon={<TableChartIcon />} label="Tables" />
                <Tab icon={<MonetizationOnIcon />} label="Expenses" />
                <Tab icon={<PeopleIcon />} label="Staff" />
                <Tab icon={<SettingsIcon />} label="Settings" />
              </Tabs>


              <Box sx={{ p: 1 }}>
                {currentTab === 0 && (
                  <Dashboard
                    financialData={financialData}
                    staffData={staffData}
                    loading={dataLoading}
                  />
                )}

                {currentTab === 1 && (
                  <Box>
                    <FinancialChart data={financialData} />
                    <FinancialTable data={financialData} />
                  </Box>
                )}

                {currentTab === 2 && (
                  <ExpenseBreakdownChart scenarioId={currentScenarioId} data={expenseData} />
                )}

                {currentTab === 3 && (
                  <StaffSummaryTable scenarioId={currentScenarioId} data={staffData} />
                )}

                {currentTab === 4 && (
                  <RyzeParametersForm
                    scenarioId={currentScenarioId}
                    onParametersUpdated={handleParametersUpdated}
                  />
                )}
              </Box>
            </>
          )}

          {!currentScenarioId && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
              <Typography variant="h6" color="text.secondary">
                Please select or create a scenario to begin
              </Typography>
            </Box>
          )}
        </Container>

        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 2, mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              RYZE.ai Financial Forecasting Tool © {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;