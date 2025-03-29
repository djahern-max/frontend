import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FinancialChart from './components/FinancialChart';
import FinancialTable from './components/FinancialTable';
import RyzeParametersForm from './components/RyzeParametersForm';
import StaffSummaryTable from './components/StaffSummaryTable';
import ExpenseBreakdownChart from './components/ExpenseBreakdownChart';
import ScenarioManager from './components/ScenarioManager';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PrivateRoute from './components/auth/PrivateRoute';

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
  const [currentPage, setCurrentPage] = useState('dashboard');
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
      setExpenseData(null);

      console.log("Fetching data for scenario ID:", currentScenarioId);

      // Fetch all data sources simultaneously
      const [financials, staff, expenses] = await Promise.all([
        getScenarioYearlyFinancials(currentScenarioId),
        getScenarioStaffSummary(currentScenarioId),
        getScenarioExpenseBreakdown(currentScenarioId)
      ]);

      console.log("Data received:", { financials, staff, expenses });

      // Set all pieces of data
      setFinancialData(financials);
      setStaffData(staff);
      setExpenseData(expenses);
    } catch (error) {
      console.error('Error fetching scenario data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleScenarioChange = (scenarioId) => {
    console.log("Scenario selected:", scenarioId);
    setCurrentScenarioId(scenarioId);
  };

  const handleNavigateToSettings = () => {
    setCurrentPage('settings');
  };

  const handleParametersUpdated = (updatedData) => {
    // Update the financial data after parameters change
    if (updatedData) {
      setFinancialData(updatedData);
    }
    // Refresh all data
    fetchScenarioData();
  };

  // Map page values to their corresponding indices for content rendering
  const pageToContentMap = {
    'dashboard': 0,
    'tables': 1,
    'expenses': 2,
    'staff': 3,
    'settings': 4
  };

  const currentTabIndex = pageToContentMap[currentPage] || 0;

  // Main application content
  const MainApp = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <ScenarioManager
          currentScenarioId={currentScenarioId}
          onScenarioChange={handleScenarioChange}
          onNavigateToSettings={handleNavigateToSettings}
        />

        {currentScenarioId && (
          <Box sx={{ p: 1 }}>
            {currentTabIndex === 0 && (
              <Dashboard
                financialData={financialData}
                staffData={staffData}
                loading={dataLoading}
                onNavigateToSettings={handleNavigateToSettings}
              />
            )}

            {currentTabIndex === 1 && (
              <Box>
                <FinancialChart data={financialData} />
                <FinancialTable data={financialData} />
              </Box>
            )}

            {currentTabIndex === 2 && (
              <ExpenseBreakdownChart scenarioId={currentScenarioId} data={expenseData} />
            )}

            {currentTabIndex === 3 && (
              <StaffSummaryTable scenarioId={currentScenarioId} data={staffData} />
            )}

            {currentTabIndex === 4 && (
              <RyzeParametersForm
                scenarioId={currentScenarioId}
                onParametersUpdated={handleParametersUpdated}
              />
            )}
          </Box>
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
            GrowthCanvas Financial Tool © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/" element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/tables" element={<Navigate to="/" replace />} />
          <Route path="/expenses" element={<Navigate to="/" replace />} />
          <Route path="/staff" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;