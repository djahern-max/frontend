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
import { getYearlyFinancials } from '../api/financialService';

const FinancialTable = ({ data }) => {
  const [financials, setFinancials] = useState([]);
  const limitedFinancials = financials.filter(item => item.year <= 2030);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If data is provided through props, use it
    if (data) {
      setFinancials(data);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch data from API
    const fetchData = async () => {
      try {
        const apiData = await getYearlyFinancials();
        setFinancials(apiData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [data]);

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!financials || financials.length === 0) {
    return (
      <Container sx={{ padding: 4 }}>
        <Typography>No data available</Typography>
      </Container>
    );
  }

  // Format number as millions with 1 decimal place
  const formatMillions = (value) => {
    const millions = value / 1000000;
    return `${millions.toFixed(1)}M`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        5 Year Projection
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>YEAR</TableCell>
              {limitedFinancials.map(item => (
                <TableCell key={item.year} align="right">{item.year}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#e8f5e9', fontWeight: 'bold' }}>Income</TableCell>
              {limitedFinancials.map(item => (
                <TableCell
                  key={`income-${item.year}`}
                  align="right"
                  sx={{ color: 'green', fontWeight: 'bold' }}
                >
                  {formatMillions(item.income)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#ffebee', fontWeight: 'bold' }}>Expenses</TableCell>
              {limitedFinancials.map(item => (
                <TableCell
                  key={`expense-${item.year}`}
                  align="right"
                  sx={{ color: 'red', fontWeight: 'bold' }}
                >
                  {formatMillions(item.expenses)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>EBITDA</TableCell>
              {limitedFinancials.map(item => (
                <TableCell
                  key={`ebitda-${item.year}`}
                  align="right"
                  sx={{ color: 'blue', fontWeight: 'bold' }}
                >
                  {formatMillions(item.ebitda)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default FinancialTable;
