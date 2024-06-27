import React from 'react';
import StatusIndicator from './StatusIndicator';

const appointments = [
  { time: '09:00 AM', status: 'green' },
  { time: '09:30 AM', status: 'yellow' },
  { time: '10:00 AM', status: 'red' },
  { time: '10:30 AM', status: 'green' },
  { time: '11:00 AM', status: 'green' },
  { time: '12:00 PM', status: 'yellow' },
  { time: '12:30 PM', status: 'green' }
];

const AppointmentList = () => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2">
        <span>Horários</span>
        <span>Status</span>
      </div>
      {appointments.map((appointment, index) => (
        <div key={index} className="flex justify-between items-center bg-blue-500 p-2 rounded">
          <span>{appointment.time}</span>
          <StatusIndicator status={appointment.status} />
        </div>
      ))}
      <button className="bg-green-500 text-white py-2 px-4 rounded mt-4">Revisar Agendamento</button>
    </div>
  );
};

export default AppointmentList;
