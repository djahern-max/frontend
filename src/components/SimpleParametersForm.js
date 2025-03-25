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
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getGrowthParameters, updateGrowthParameters } from '../api/financialService';

const RyzeParametersForm = ({ onParametersUpdated }) => {
  const [params, setParams] = useState({
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
    sales_base_salary: 5000,
    sales_commission: 0.05,
    jr_dev_salary: 8333,
    admin_salary: 8333,
    marketing_percentage: 0.15,
    infrastructure_cost_per_user: 1.5,
    other_expenses_percentage: 0.10
  });

  const [startDate, setStartDate] = useState(new Date('2025-04-01'));

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const data = await getGrowthParameters();
        if (data) {
          setParams(data);
          if (data.start_date) {
            setStartDate(new Date(data.start_date));
          }
        }
      } catch (error) {
        console.error('Error fetching parameters:', error);
      }
    };

    fetchParameters();
  }, []);

  const handleDateChange = (date) => {
    setStartDate(date);
    setParams(prev => ({
      ...prev,
      start_date: date.toISOString().split('T')[0]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGrowthRateChange = (type, index, value) => {
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

    try {
      const result = await updateGrowthParameters(params);

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

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        RYZE.ai Financial Projection Parameters
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start Date & Initial Values
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  inputFormat="yyyy-MM-dd"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Clients"
                name="initial_clients"
                type="number"
                value={params.initial_clients}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Developers"
                name="initial_developers"
                type="number"
                value={params.initial_developers}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Initial Affiliates"
                name="initial_affiliates"
                type="number"
                value={params.initial_affiliates}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
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
                  value={params.subscription_price}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Affiliate Commission ($)"
                  name="affiliate_commission"
                  type="number"
                  value={params.affiliate_commission}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Free Months"
                  name="free_months"
                  type="number"
                  value={params.free_months}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 12, step: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Conversion Rate"
                  name="conversion_rate"
                  type="number"
                  value={params.conversion_rate * 100}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'conversion_rate',
                      value: parseFloat(e.target.value) / 100
                    }
                  })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    inputProps: { min: 0, max: 100, step: 1 },
                    endAdornment: '%'
                  }}
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
                  label="Sales Start (Month #)"
                  name="sales_start_month"
                  type="number"
                  value={params.sales_start_month}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 60, step: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Sales Hiring Interval (Months)"
                  name="sales_hiring_interval"
                  type="number"
                  value={params.sales_hiring_interval}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 1, max: 12, step: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Max Sales Staff"
                  name="max_sales_staff"
                  type="number"
                  value={params.max_sales_staff}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 1, max: 100, step: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Jr. Developer Start (Month #)"
                  name="jr_dev_start_month"
                  type="number"
                  value={params.jr_dev_start_month}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 60, step: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Admin Start (Month #)"
                  name="admin_start_month"
                  type="number"
                  value={params.admin_start_month}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 60, step: 1 } }}
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
                  value={params.cto_salary}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sales Base Salary ($/month)"
                  name="sales_base_salary"
                  type="number"
                  value={params.sales_base_salary}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Sales Commission (%)"
                  name="sales_commission"
                  type="number"
                  value={params.sales_commission * 100}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'sales_commission',
                      value: parseFloat(e.target.value) / 100
                    }
                  })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Jr. Developer Salary ($/month)"
                  name="jr_dev_salary"
                  type="number"
                  value={params.jr_dev_salary}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 100 } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Admin Salary ($/month)"
                  name="admin_salary"
                  type="number"
                  value={params.admin_salary}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 100 } }}
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
                    {params[`${type}_growth_rates`].map((rate, index) => (
                      <Grid item xs={12} sm={2.4} key={`${type}-${index}`}>
                        <Typography>Year {index + 1}</Typography>
                        <Slider
                          value={rate * 100}
                          onChange={(e, newValue) => handleGrowthRateChange(type, index, newValue)}
                          valueLabelDisplay="auto"
                          step={0.5}
                          min={0}
                          max={20}
                          valueLabelFormat={(value) => `${value}%`}
                        />
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                          {(rate * 100).toFixed(1)}%
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
                  value={params.marketing_percentage * 100}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'marketing_percentage',
                      value: parseFloat(e.target.value) / 100
                    }
                  })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Infrastructure ($ per user)"
                  name="infrastructure_cost_per_user"
                  type="number"
                  value={params.infrastructure_cost_per_user}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Other Expenses (% of Revenue)"
                  name="other_expenses_percentage"
                  type="number"
                  value={params.other_expenses_percentage * 100}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'other_expenses_percentage',
                      value: parseFloat(e.target.value) / 100
                    }
                  })}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
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