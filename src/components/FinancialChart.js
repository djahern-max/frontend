import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography, Paper, Container, CircularProgress } from '@mui/material';
import { getYearlyFinancials } from '../api/financialService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '5 Year Financial Projection',
      font: {
        size: 20
      }
    },
  },
  scales: {
    y: {
      ticks: {
        callback: function (value) {
          return value + 'M';
        }
      }
    }
  }
};

const processData = (data) => {
  if (!data || !data.length) return null;

  const sliced = data
    .sort((a, b) => a.year - b.year)
    .filter(item => item.year <= 2030);

  return {
    labels: sliced.map(item => item.year),
    datasets: [
      {
        label: 'Income',
        data: sliced.map(item => parseFloat(item.income) / 1000000),
        borderColor: 'rgb(75, 192, 75)',
        backgroundColor: 'rgba(75, 192, 75, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: sliced.map(item => parseFloat(item.expenses) / 1000000),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
      {
        label: 'EBITDA',
        data: sliced.map(item => parseFloat(item.ebitda) / 1000000),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };
};


const FinancialChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If data is provided through props, use it
    if (data) {
      setChartData(processData(data));
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch data from API
    const fetchData = async () => {
      try {
        const apiData = await getYearlyFinancials();
        setChartData(processData(apiData));
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

  if (!chartData) {
    return (
      <Container sx={{ padding: 4 }}>
        <Typography>No data available</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ height: '400px' }}>
          <Line options={options} data={chartData} />
        </Box>
        <Typography variant="body2" sx={{ mt: 1, mb: 0, textAlign: 'center' }}>
          Projection shows aggressive growth from April 2025 to 2030
        </Typography>
      </Paper>
    </Container>
  );
};

export default FinancialChart;