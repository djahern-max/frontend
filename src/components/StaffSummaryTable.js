import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Container,
    CircularProgress
} from '@mui/material';
import { getScenarioStaffSummary } from '../api/financialService';

const StaffSummaryTable = ({ scenarioId, data }) => {
    const [staffData, setStaffData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (scenarioId) {
            fetchData();
        } else if (data) {
            setStaffData(data);
            setIsLoading(false);
        }
    }, [scenarioId, data]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await getScenarioStaffSummary(scenarioId);
            setStaffData(response);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching staff data:', error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!staffData || staffData.length === 0) {
        return (
            <Container sx={{ padding: 2 }}>
                <Typography>No staff data available</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom align="center">
                Staff Growth Projection
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>YEAR</TableCell>
                            {staffData.map(item => (
                                <TableCell key={item.year} align="right">{item.year}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Clients</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`clients-${item.year}`} align="right">
                                    {item.client_count.toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Paying Clients</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`paying-${item.year}`} align="right">
                                    {(item.paying_clients || 0).toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Developers</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`developers-${item.year}`} align="right">
                                    {item.developer_count.toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Affiliates</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`affiliates-${item.year}`} align="right">
                                    {item.affiliate_count.toLocaleString()}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sales Staff</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`sales-${item.year}`} align="right">
                                    {item.sales_staff}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Junior Developers</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`devs-${item.year}`} align="right">
                                    {item.jr_devs}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Admin Staff</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`admin-${item.year}`} align="right">
                                    {item.admin_staff}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>CTO</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`cto-${item.year}`} align="right">
                                    {item.cto_count}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>CEO</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`ceo-${item.year}`} align="right">
                                    {/* Use a fallback value (1) if ceo_count is not defined */}
                                    {item.ceo_count !== undefined ? item.ceo_count : 1}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#e8f4ff', fontWeight: 'bold' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>TOTAL STAFF</TableCell>
                            {staffData.map(item => (
                                <TableCell key={`total-${item.year}`} align="right" sx={{ fontWeight: 'bold' }}>
                                    {item.total_staff}
                                </TableCell>
                            ))}
                        </TableRow>

                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default StaffSummaryTable;