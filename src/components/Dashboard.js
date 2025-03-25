import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getYearlyFinancials, getStaffSummary } from '../api/financialService';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Format currency
const formatCurrency = (value) => {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(0);
};

const Dashboard = () => {
    const [financialData, setFinancialData] = useState(null);
    const [staffData, setStaffData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch financial data
                const financials = await getYearlyFinancials();
                setFinancialData(financials);

                // Fetch staff data
                const staff = await getStaffSummary();
                setStaffData(staff);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!financialData || !staffData) {
        return (
            <Container sx={{ padding: 4 }}>
                <Typography>No data available</Typography>
            </Container>
        );
    }

    // Calculate key metrics
    const latestYearData = financialData[financialData.length - 1];
    const firstYearData = financialData[0];
    const totalRevenue = financialData.reduce((sum, item) => sum + item.income, 0);
    const totalProfit = financialData.reduce((sum, item) => sum + item.ebitda, 0);
    const finalClientCount = latestYearData.client_count;
    const finalStaffCount = latestYearData.total_staff;

    // Prepare chart data
    const years = financialData.map(item => item.year);

    // Revenue & EBITDA chart
    const revenueChartData = {
        labels: years,
        datasets: [
            {
                label: 'Revenue',
                data: financialData.map(item => item.income),
                borderColor: 'rgb(65, 171, 93)',
                backgroundColor: 'rgba(65, 171, 93, 0.5)',
                tension: 0.3,
            },
            {
                label: 'EBITDA',
                data: financialData.map(item => item.ebitda),
                borderColor: 'rgb(66, 133, 244)',
                backgroundColor: 'rgba(66, 133, 244, 0.5)',
                tension: 0.3,
            }
        ],
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        if (value >= 1000000) {
                            return '$' + (value / 1000000).toFixed(0) + 'M';
                        } else if (value >= 1000) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                        return '$' + value;
                    }
                }
            }
        }
    };

    // Client Growth chart
    const clientChartData = {
        labels: years,
        datasets: [
            {
                label: 'Total Clients',
                data: financialData.map(item => item.client_count),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Paying Clients',
                data: financialData.map(item => item.paying_clients),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const clientChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                        return value;
                    }
                }
            }
        }
    };

    // Staff Growth chart
    const staffChartData = {
        labels: years,
        datasets: [
            {
                label: 'Sales Staff',
                data: staffData.map(item => item.sales_staff),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
            },
            {
                label: 'Developers',
                data: staffData.map(item => item.jr_devs),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
            },
            {
                label: 'Admin',
                data: staffData.map(item => item.admin_staff),
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
            },
            {
                label: 'CTO',
                data: staffData.map(item => item.cto_count),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
            },
        ]
    };

    const staffChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true
            }
        }
    };

    // Expense breakdown doughnut chart (using latest year data)
    const finalYearExpenseTotal = latestYearData.expenses;

    // Calculate staff costs from the final year
    const staffCosts = latestYearData.total_staff * 100000; // Rough approximation
    const marketingCosts = latestYearData.income * 0.15; // 15% of revenue
    const affiliateCosts = latestYearData.affiliate_count * 5 * 12; // $5 per affiliate per month
    const infrastructureCosts = latestYearData.client_count * 1.5 * 12; // $1.5 per user per month
    const otherCosts = finalYearExpenseTotal - (staffCosts + marketingCosts + affiliateCosts + infrastructureCosts);

    const expenseBreakdownData = {
        labels: ['Staff', 'Marketing', 'Affiliate Program', 'Infrastructure', 'Other'],
        datasets: [
            {
                data: [staffCosts, marketingCosts, affiliateCosts, infrastructureCosts, otherCosts],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Render dashboard
    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    RYZE.ai Executive Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    5-Year Financial Projection Overview
                </Typography>
            </Box>

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#f9fafe' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(totalRevenue)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Over 5 years
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#f4fbf7' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Total Profit
                            </Typography>
                            <Typography variant="h4" color={totalProfit >= 0 ? 'success.main' : 'error.main'}>
                                {formatCurrency(totalProfit)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Over 5 years
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#fcf9fa' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Final Client Count
                            </Typography>
                            <Typography variant="h4">
                                {finalClientCount.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                End of Year 5
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#f6f9fd' }}>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Total Staff
                            </Typography>
                            <Typography variant="h4">
                                {finalStaffCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                End of Year 5
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Revenue & Profit Chart */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Revenue & EBITDA Growth
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Line data={revenueChartData} options={revenueChartOptions} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Final Year Expense Breakdown
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Doughnut
                                data={expenseBreakdownData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 12,
                                                font: {
                                                    size: 11
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Client & Staff Growth */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Client Growth
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            <Line data={clientChartData} options={clientChartOptions} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Staff Growth
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            <Bar data={staffChartData} options={staffChartOptions} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;