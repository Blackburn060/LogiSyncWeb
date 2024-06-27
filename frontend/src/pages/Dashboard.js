import React from 'react';
import Navbar from '../components/Navbar';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="flex p-4 space-x-4">
        <Calendar />
        <Schedule />
      </div>
    </div>
  );
};

export default Dashboard;
