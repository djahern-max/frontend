import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  useTheme,
  ThemeProvider,
  createTheme
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

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
      // Fetch financial data
      const financials = await getScenarioYearlyFinancials(currentScenarioId);
      setFinancialData(financials);

      // Fetch staff data
      const staff = await getScenarioStaffSummary(currentScenarioId);
      setStaffData(staff);

      // Fetch expense data
      const expenses = await getScenarioExpenseBreakdown(currentScenarioId);
      setExpenseData(expenses);

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
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
              RYZE.ai Financial Planner
            </Typography>
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
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<BarChartIcon />} label="Dashboard" />
                <Tab icon={<TableChartIcon />} label="Financial Tables" />
                <Tab icon={<MonetizationOnIcon />} label="Expense Breakdown" />
                <Tab icon={<PeopleIcon />} label="Staff Planning" />
                <Tab icon={<SettingsIcon />} label="Parameters" />
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