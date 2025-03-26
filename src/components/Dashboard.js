import React from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
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
    if (!value) return '$0';
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(0);
};

const Dashboard = ({ financialData, staffData, loading }) => {
    console.log("Dashboard props:", { loading, financialData, staffData });

    // Super defensive check
    if (loading || !financialData || !staffData || !Array.isArray(financialData) || !Array.isArray(staffData) || financialData.length === 0 || staffData.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    try {

        const filteredFinancialData = financialData.filter(item => item.year <= 2030);
        const filteredStaffData = staffData.filter(item => item.year <= 2030);
        // Calculate key metrics with null safety
        const latestYearData = financialData[financialData.length - 1] || {};
        const latestStaffData = staffData[staffData.length - 1] || {};
        const firstYearData = financialData[0] || {};

        // Safe data access with defaults
        const totalRevenue = financialData.reduce((sum, item) => sum + (item?.income || 0), 0);
        const totalProfit = financialData.reduce((sum, item) => sum + (item?.ebitda || 0), 0);
        const finalClientCount = latestYearData?.client_count || 0;
        const finalStaffCount = latestYearData?.total_staff || 0;

        // Prepare chart data
        const years = financialData.map(item => item?.year);

        // Revenue & EBITDA chart
        const revenueChartData = {
            labels: filteredFinancialData.map(item => item?.year),
            datasets: [
                {
                    label: 'Revenue',
                    data: filteredFinancialData.map(item => item?.income || 0),
                    borderColor: 'rgb(65, 171, 93)',
                    backgroundColor: 'rgba(65, 171, 93, 0.5)',
                    tension: 0.3,
                },
                {
                    label: 'EBITDA',
                    data: filteredFinancialData.map(item => item?.ebitda || 0),
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
        // Client Growth chart
        const clientChartData = {
            labels: filteredFinancialData.map(item => item?.year),  // Use filtered data for labels
            datasets: [
                {
                    label: 'Total Clients',
                    data: filteredFinancialData.map(item => item?.client_count || 0),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.3,
                },
                {
                    label: 'Paying Clients',
                    data: filteredFinancialData.map(item => item?.paying_clients || 0),
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
            labels: filteredStaffData.map(item => item?.year),  // Use filtered staff data for labels
            datasets: [
                {
                    label: 'Sales Staff',
                    data: filteredStaffData.map(item => item?.sales_staff || 0),  // Use filtered data
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                },
                {
                    label: 'Developers',
                    data: filteredStaffData.map(item => item?.jr_devs || 0),  // Use filtered data
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                },
                {
                    label: 'Admin',
                    data: filteredStaffData.map(item => item?.admin_staff || 0),  // Use filtered data
                    backgroundColor: 'rgba(255, 206, 86, 0.7)',
                },
                {
                    label: 'CTO',
                    data: filteredStaffData.map(item => item?.cto_count || 0),  // Use filtered data
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                },
                {
                    label: 'CEO',
                    data: filteredStaffData.map(() => 1),  // Use filtered data length
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
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
        const finalYearExpenseTotal = latestYearData?.expenses || 0;

        // Calculate staff costs from the final year
        const staffCosts = (latestYearData?.total_staff || 0) * 100000; // Rough approximation
        const marketingCosts = (latestYearData?.income || 0) * 0.15; // 15% of revenue
        const affiliateCosts = (latestYearData?.affiliate_count || 0) * 5 * 12; // $5 per affiliate per month
        const infrastructureCosts = (latestYearData?.client_count || 0) * 1.5 * 12; // $1.5 per user per month
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


        return (
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            fontWeight: 500,
                            color: 'text.primary',
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: '-8px',
                                left: 0,
                                width: '40px',
                                height: '3px',
                                backgroundColor: 'primary.main',
                                borderRadius: '3px',
                            }
                        }}
                    >
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
                                    Users
                                </Typography>
                                <Typography variant="h4">
                                    {((latestYearData?.client_count || 0) + (latestStaffData?.developer_count || 0)).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Clients: {(latestYearData?.client_count || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Developers: {(latestStaffData?.developer_count || 0).toLocaleString()}
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
    } catch (error) {
        console.error("Error rendering Dashboard:", error);
        return (
            <Container sx={{ padding: 4 }}>
                <Typography variant="h6" color="error">
                    Error loading dashboard data. Please try again later.
                </Typography>
            </Container>
        );
    }
};

export default Dashboard;