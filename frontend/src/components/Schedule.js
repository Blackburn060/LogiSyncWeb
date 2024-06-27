import React from 'react';
import AppointmentList from './AppointmentList';

const Schedule = () => {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg flex-grow">
      <h2 className="text-lg mb-4">Segunda-Feira, 13 de Janeiro de 2024</h2>
      <AppointmentList />
    </div>
  );
};

export default Schedule;
