import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Paper, Container, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getScenarioExpenseBreakdown } from '../api/financialService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ExpenseBreakdownChart = ({ scenarioId, data }) => {
    const [expenseData, setExpenseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        if (scenarioId) {
            fetchData();
        } else if (data) {
            processData(data);
            setIsLoading(false);
        }
    }, [scenarioId, data]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await getScenarioExpenseBreakdown(scenarioId);
            processData(response);
        } catch (error) {
            console.error('Error fetching expense data:', error);
            setIsLoading(false);
        }
    };

    const processData = (data) => {
        if (!data || data.length === 0) {
            setIsLoading(false);
            return;
        }

        // Extract years
        const years = [...new Set(data.map(item => item.year))];
        setAvailableYears(years);

        // Default to first year
        if (years.length > 0 && !selectedYear) {
            setSelectedYear(years[0]);
        }

        setExpenseData(data);
        setIsLoading(false);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!expenseData || expenseData.length === 0) {
        return (
            <Container sx={{ padding: 4 }}>
                <Typography>No expense data available</Typography>
            </Container>
        );
    }

    // Filter data for selected year
    const yearData = expenseData.filter(item => item.year === selectedYear);

    // Sort by month
    yearData.sort((a, b) => a.month - b.month);

    // Create labels (months)
    const labels = yearData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short' });
    });

    // Create datasets for each expense category
    const chartData = {
        labels,
        datasets: [
            {
                label: 'CTO Costs',
                data: yearData.map(item => item.cto_cost),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
            },
            {
                label: 'Sales Staff',
                data: yearData.map(item => item.sales_cost),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
            },
            {
                label: 'Jr. Developers',
                data: yearData.map(item => item.jr_dev_cost),
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
            },
            {
                label: 'Admin Staff',
                data: yearData.map(item => item.admin_cost),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
            },
            {
                label: 'Infrastructure',
                data: yearData.map(item => item.infrastructure_cost),
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
            },
            {
                label: 'Marketing',
                data: yearData.map(item => item.marketing_cost),
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
            },
            {
                label: 'Affiliate Costs',
                data: yearData.map(item => item.affiliate_cost),
                backgroundColor: 'rgba(199, 199, 199, 0.7)',
            },
            {
                label: 'Other Expenses',
                data: yearData.map(item => item.other_expenses),
                backgroundColor: 'rgba(83, 102, 255, 0.7)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Expense Breakdown for ${selectedYear}`,
                font: {
                    size: 18
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                ticks: {
                    callback: function (value) {
                        if (value >= 1000000) {
                            return '$' + (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return '$' + (value / 1000).toFixed(1) + 'K';
                        }
                        return '$' + value;
                    }
                }
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Monthly Expense Breakdown</Typography>
                    <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel id="year-select-label">Year</InputLabel>
                        <Select
                            labelId="year-select-label"
                            id="year-select"
                            value={selectedYear}
                            label="Year"
                            onChange={handleYearChange}
                        >
                            {availableYears.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ height: '500px' }}>
                    <Bar options={options} data={chartData} />
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontSize: '0.85rem', color: 'text.secondary' }}>
                    This chart shows how expenses are distributed across different categories each month.
                    As RYZE.ai grows, staff costs will gradually increase with new hires.
                </Typography>
            </Paper>
        </Container>
    );
};

export default ExpenseBreakdownChart;