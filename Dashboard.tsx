import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Papa from 'papaparse';

// Utility function to load CSV data
const loadHotelData = async (csvFile: string) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      download: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Date Filter Component
const DateFilter: React.FC<{ onDateChange: (startDate: string, endDate: string) => void }> = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDateChange = () => {
    onDateChange(startDate, endDate);
  };

  return (
    <div>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={handleDateChange}>Apply</button>
    </div>
  );
};

// Time Series Chart (Visitors per Day)
const TimeSeriesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const series = [
    {
      name: 'Visitors',
      data: data.map((entry) => ({
        x: new Date(entry.arrival_date_year, entry.arrival_date_month - 1, entry.arrival_date_day_of_month),
        y: entry.adults + entry.children + entry.babies,
      })),
    },
  ];

  const options = {
    chart: {
      type: 'line',
      zoom: { enabled: true },
    },
    xaxis: { type: 'datetime' },
    yaxis: { title: { text: 'Number of Visitors' } },
  };

  return <Chart options={options} series={series} type="line" height={350} />;
};

// Column Chart (Visitors per Country)
const ColumnChart: React.FC<{ data: any[] }> = ({ data }) => {
  const countryData = data.reduce((acc, entry) => {
    acc[entry.country] = (acc[entry.country] || 0) + entry.adults + entry.children + entry.babies;
    return acc;
  }, {});

  const series = [{ name: 'Visitors', data: Object.values(countryData) }];

  const options = {
    chart: { type: 'bar' },
    xaxis: { categories: Object.keys(countryData) },
    yaxis: { title: { text: 'Number of Visitors' } },
  };

  return <Chart options={options} series={series} type="bar" height={350} />;
};

// Sparkline Chart (for Adults/Children Visitors)
const SparklineChart: React.FC<{ title: string; data: number[] }> = ({ title, data }) => {
  const options = {
    chart: { type: 'line', sparkline: { enabled: true } },
    title: { text: title },
  };

  return <Chart options={options} series={[{ data }]} type="line" height={100} />;
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [hotelData, setHotelData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await loadHotelData('/path_to_csv_file/hotel_bookings_1000.csv'); // Update with your file path
      setHotelData(data);
      setFilteredData(data);
    }
    fetchData();
  }, []);

  const handleDateChange = (startDate: string, endDate: string) => {
    const filtered = hotelData.filter((entry) => {
      const entryDate = new Date(entry.arrival_date_year, entry.arrival_date_month - 1, entry.arrival_date_day_of_month);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
    setFilteredData(filtered);
  };

  return (
    <div>
      <DateFilter onDateChange={handleDateChange} />
      <TimeSeriesChart data={filteredData} />
      <ColumnChart data={filteredData} />
      <SparklineChart title="Adult Visitors" data={filteredData.map((d) => d.adults)} />
      <SparklineChart title="Children Visitors" data={filteredData.map((d) => d.children)} />
    </div>
  );
};

export default Dashboard;
