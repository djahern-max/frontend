import apiService from './apiService';

/**
 * Get all available forecast scenarios
 */
export const getScenarios = async () => {
  try {
    const response = await apiService.scenarios.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

/**
 * Get a specific scenario by ID
 */
export const getScenario = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getById(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching scenario ${scenarioId}:`, error);
    return null;
  }
};

/**
 * Create a new forecast scenario
 */
export const createScenario = async (data) => {
  try {
    const response = await apiService.scenarios.create(data);
    return response.data;
  } catch (error) {
    console.error('Error creating scenario:', error);
    return null;
  }
};

/**
 * Update a forecast scenario
 */
export const updateScenario = async (scenarioId, data) => {
  try {
    const response = await apiService.scenarios.update(scenarioId, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating scenario ${scenarioId}:`, error);
    return null;
  }
};

/**
 * Delete a forecast scenario
 */
export const deleteScenario = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.delete(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error deleting scenario ${scenarioId}:`, error);
    return null;
  }
};

/**
 * Get yearly financial summary for a specific scenario
 */
export const getScenarioYearlyFinancials = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getYearlyFinancials(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching yearly financials for scenario ${scenarioId}:`, error);
    return [];
  }
};

/**
 * Get monthly financial data for a specific scenario
 */
export const getScenarioMonthlyFinancials = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getMonthlyFinancials(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly financials for scenario ${scenarioId}:`, error);
    return [];
  }
};

/**
 * Get growth parameters for a specific scenario
 */
export const getScenarioParameters = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getParameters(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching parameters for scenario ${scenarioId}:`, error);
    return null;
  }
};

/**
 * Update growth parameters for a specific scenario
 */
export const updateScenarioParameters = async (scenarioId, params) => {
  try {
    const response = await apiService.scenarios.updateParameters(scenarioId, params);
    return response.data;
  } catch (error) {
    console.error(`Error updating parameters for scenario ${scenarioId}:`, error);
    return { status: 'error', message: 'Failed to update parameters' };
  }
};

/**
 * Get staff summary data for a specific scenario
 */
export const getScenarioStaffSummary = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getYearlyStaff(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff summary for scenario ${scenarioId}:`, error);
    return [];
  }
};

/**
 * Get expense breakdown data for a specific scenario
 */
export const getScenarioExpenseBreakdown = async (scenarioId) => {
  try {
    const response = await apiService.scenarios.getMonthlyExpenses(scenarioId);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense breakdown for scenario ${scenarioId}:`, error);
    return [];
  }
};

// Legacy API functions - these will now use the default scenario internally

/**
 * Get yearly financial summary
 */
export const getYearlyFinancials = async () => {
  try {
    // Use the standard api object from apiService for legacy endpoints
    const response = await apiService.get('/api/financials/yearly');
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly financials:', error);
    return [];
  }
};

/**
 * Get monthly financial data
 */
export const getMonthlyFinancials = async () => {
  try {
    const response = await apiService.get('/api/financials/monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly financials:', error);
    return [];
  }
};

/**
 * Get all growth parameters
 */
export const getGrowthParameters = async () => {
  try {
    const response = await apiService.get('/api/parameters');
    return response.data;
  } catch (error) {
    console.error('Error fetching growth parameters:', error);
    return null;
  }
};

/**
 * Update growth parameters and retrieve updated forecast
 */
export const updateGrowthParameters = async (params) => {
  try {
    const response = await apiService.post('/api/parameters/update', params);
    return response.data;
  } catch (error) {
    console.error('Error updating growth parameters:', error);
    return { status: 'error', message: 'Failed to update parameters' };
  }
};

/**
 * Get staff summary data
 */
export const getStaffSummary = async () => {
  try {
    const response = await apiService.get('/api/staff/yearly');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff summary:', error);
    return [];
  }
};

/**
 * Get expense breakdown data
 */
export const getExpenseBreakdown = async () => {
  try {
    const response = await apiService.get('/api/expense-breakdown/monthly');
    return response.data;
  } catch (error) {
    console.error('Error fetching expense breakdown:', error);
    return [];
  }
};

export default {
  // Scenario management
  getScenarios,
  getScenario,
  createScenario,
  updateScenario,
  deleteScenario,

  // Scenario specific data
  getScenarioYearlyFinancials,
  getScenarioMonthlyFinancials,
  getScenarioParameters,
  updateScenarioParameters,
  getScenarioStaffSummary,
  getScenarioExpenseBreakdown,

  // Legacy functions (using default scenario)
  getYearlyFinancials,
  getMonthlyFinancials,
  getGrowthParameters,
  updateGrowthParameters,
  getStaffSummary,
  getExpenseBreakdown
};