import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Slider,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  getScenarioParameters,
  updateScenarioParameters
} from '../api/financialService';

// Initial default parameter values
const DEFAULT_PARAMS = {
  start_date: "2025-04-01",
  initial_clients: 0,
  initial_developers: 0,
  initial_affiliates: 0,
  client_growth_rates: [0.10, 0.12, 0.15, 0.12, 0.10],
  developer_growth_rates: [0.05, 0.07, 0.10, 0.08, 0.06],
  affiliate_growth_rates: [0.08, 0.10, 0.12, 0.10, 0.08],
  subscription_price: 25,
  affiliate_commission: 5,
  free_months: 1,
  conversion_rate: 0.75,
  cto_start_month: 0,
  sales_start_month: 3,
  sales_hiring_interval: 3,
  max_sales_staff: 10,
  jr_dev_start_month: 6,
  admin_start_month: 6,
  cto_salary: 12500,
  sales_base_salary: 10000, // Updated to $10,000/month
  sales_commission: 0.05,
  jr_dev_salary: 8333,
  admin_salary: 8333,
  ceo_start_month: 6,
  ceo_salary: 16667,
  marketing_percentage: 0.15,
  infrastructure_cost_per_user: 1.5,
  other_expenses_percentage: 0.10
};

const RyzeParametersForm = ({ scenarioId, onParametersUpdated }) => {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (scenarioId) {
      fetchParameters();
    }
  }, [scenarioId]);

  const fetchParameters = async () => {
    try {
      setInitialLoading(true);
      const data = await getScenarioParameters(scenarioId);
      if (data) {
        // Ensure all numeric values have defaults if they're undefined
        const safeData = { ...DEFAULT_PARAMS };

        // Only update values that exist in the response
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            safeData[key] = data[key];
          }
        });

        setParams(safeData);
      }
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow empty string during typing for better UX
    if (value === '') {
      setParams((prev) => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    // For numeric fields, parse the value
    if (typeof DEFAULT_PARAMS[name] === 'number') {
      const parsedValue = Number(value);
      // Only update if it's a valid number, otherwise keep the current value
      if (!isNaN(parsedValue)) {
        setParams((prev) => ({
          ...prev,
          [name]: parsedValue
        }));
      }
    } else {
      // For non-numeric fields, just set the value
      setParams((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePercentageChange = (e) => {
    const { name, value } = e.target;

    // Allow empty string during typing
    if (value === '') {
      setParams((prev) => ({
        ...prev,
        [name]: ''
      }));
      return;
    }

    const parsedValue = Number(value);
    if (!isNaN(parsedValue)) {
      setParams((prev) => ({
        ...prev,
        [name]: parsedValue / 100
      }));
    }
  };

  const handleGrowthRateChange = (type, index, value) => {
    if (isNaN(value)) {
      value = DEFAULT_PARAMS[`${type}_growth_rates`][index] * 100;
    }

    const newRates = [...params[`${type}_growth_rates`]];
    newRates[index] = value / 100; // Convert from percentage to decimal

    setParams((prev) => ({
      ...prev,
      [`${type}_growth_rates`]: newRates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create a sanitized version of params for submission
    // Replace any empty strings with default values
    const submissionParams = { ...params };
    Object.keys(submissionParams).forEach(key => {
      if (submissionParams[key] === '') {
        submissionParams[key] = DEFAULT_PARAMS[key];
      }
    });

    try {
      const result = await updateScenarioParameters(scenarioId, submissionParams);

      if (result.status === 'success') {
        setNotification({
          open: true,
          message: 'Parameters updated successfully!',
          severity: 'success'
        });

        if (onParametersUpdated && result.yearly_summary) {
          onParametersUpdated(result.yearly_summary);
        }
      } else {
        setNotification({
          open: true,
          message: result.message || 'Failed to update parameters',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating parameters:', error);
      setNotification({
        open: true,
        message: 'An error occurred while updating parameters',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false
    }));
  };

  // Helper to safely get rate values
  const getRateValue = (type, index) => {
    if (!params[`${type}_growth_rates`] || !params[`${type}_growth_rates`][index]) {
      return DEFAULT_PARAMS[`${type}_growth_rates`][index] * 100;
    }
    return params[`${type}_growth_rates`][index] * 100;
  };

  // Helper to safely format percentage
  const formatPercentage = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return "0.0";
    }
    return value.toFixed(1);
  };

  // Helper to get the current value or default
  const getParamValue = (name) => {
    // For empty string values, show the field as empty but use default on submission
    if (params[name] === '') {
      return '';
    }

    // Return the current value, or the default if undefined/null
    return params[name] !== undefined && params[name] !== null ?
      params[name] : DEFAULT_PARAMS[name];
  };

  // Helper to get percentage value
  const getPercentageValue = (name) => {
    if (params[name] === '') {
      return '';
    }

    const value = params[name];
    return value !== undefined && value !== null ?
      (value * 100) : (DEFAULT_PARAMS[name] * 100);
  };

  if (initialLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Financial Projection Parameters
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start Date & Initial Values
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Start Date"
                name="start_date"
                type="date"
                value={getParamValue('start_date')}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Clients"
                name="initial_clients"
                type="number"
                value={getParamValue('initial_clients')}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Developers"
                name="initial_developers"
                type="number"
                value={getParamValue('initial_developers')}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Affiliates"
                name="initial_affiliates"
                type="number"
                value={getParamValue('initial_affiliates')}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Pricing & Conversion</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Subscription Price ($)"
                  name="subscription_price"
                  type="number"
                  value={getParamValue('subscription_price')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Affiliate Commission ($)"
                  name="affiliate_commission"
                  type="number"
                  value={getParamValue('affiliate_commission')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Free Months"
                  name="free_months"
                  type="number"
                  value={getParamValue('free_months')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 12, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Conversion Rate (%)"
                  name="conversion_rate"
                  type="number"
                  value={getPercentageValue('conversion_rate')}
                  onChange={handlePercentageChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Staff Planning</Typography>
          </AccordionSummary>


          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CTO Start (Month #)"
                  name="cto_start_month"
                  type="number"
                  value={getParamValue('cto_start_month')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 60, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CEO Start (Month #)"
                  name="ceo_start_month"
                  type="number"
                  value={getParamValue('ceo_start_month')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 60, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Sales Start (Month #)"
                  name="sales_start_month"
                  type="number"
                  value={getParamValue('sales_start_month')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 60, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Sales Hiring Interval (Months)"
                  name="sales_hiring_interval"
                  type="number"
                  value={getParamValue('sales_hiring_interval')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 1, max: 12, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Sales Staff"
                  name="max_sales_staff"
                  type="number"
                  value={getParamValue('max_sales_staff')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 1, max: 100, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Jr. Developer Start (Month #)"
                  name="jr_dev_start_month"
                  type="number"
                  value={getParamValue('jr_dev_start_month')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 60, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Admin Start (Month #)"
                  name="admin_start_month"
                  type="number"
                  value={getParamValue('admin_start_month')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 60, step: 1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>

        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Salary & Compensation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="CTO Salary ($/month)"
                  name="cto_salary"
                  type="number"
                  value={getParamValue('cto_salary')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="CEO Salary ($/month)"
                  name="ceo_salary"
                  type="number"
                  value={getParamValue('ceo_salary')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sales Base Salary ($/month)"
                  name="sales_base_salary"
                  type="number"
                  value={getParamValue('sales_base_salary')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sales Commission (%)"
                  name="sales_commission"
                  type="number"
                  value={getPercentageValue('sales_commission')}
                  onChange={handlePercentageChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Jr. Developer Salary ($/month)"
                  name="jr_dev_salary"
                  type="number"
                  value={getParamValue('jr_dev_salary')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Admin Salary ($/month)"
                  name="admin_salary"
                  type="number"
                  value={getParamValue('admin_salary')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Monthly Growth Rates</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {['client', 'developer', 'affiliate'].map((type) => (
                <Grid item xs={12} key={type}>
                  <Typography variant="subtitle1" gutterBottom>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Growth Rates (% per month)
                  </Typography>
                  <Grid container spacing={2}>
                    {Array.isArray(params[`${type}_growth_rates`]) &&
                      params[`${type}_growth_rates`].map((rate, index) => (
                        <Grid item xs={12} sm={2.4} key={`${type}-${index}`}>
                          <Typography>Year {index + 1}</Typography>
                          <Slider
                            value={getRateValue(type, index)}
                            onChange={(e, newValue) => handleGrowthRateChange(type, index, newValue)}
                            valueLabelDisplay="auto"
                            step={0.5}
                            min={0}
                            max={20}
                            valueLabelFormat={(value) => `${value}%`}
                          />
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                            {formatPercentage(getRateValue(type, index))}%
                          </Typography>
                        </Grid>
                      ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Other Expenses</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Marketing (% of Revenue)"
                  name="marketing_percentage"
                  type="number"
                  value={getPercentageValue('marketing_percentage')}
                  onChange={handlePercentageChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Infrastructure ($ per user)"
                  name="infrastructure_cost_per_user"
                  type="number"
                  value={getParamValue('infrastructure_cost_per_user')}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Other Expenses (% of Revenue)"
                  name="other_expenses_percentage"
                  type="number"
                  value={getPercentageValue('other_expenses_percentage')}
                  onChange={handlePercentageChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Forecast'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
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

export default RyzeParametersForm;