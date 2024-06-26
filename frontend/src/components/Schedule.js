import React from 'react';
import './calendar.css';

const Calendar = () => {
  // Mock data, implement your logic to get dates and handle clicks
  const dates = [...Array(31).keys()].map(i => i + 1);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <span>Janeiro 2024</span>
        <div className="calendar-navigation">
          <button>{'<'}</button>
          <button>{'>'}</button>
        </div>
      </div>
      <div className="calendar-grid">
        {dates.map(date => (
          <div key={date} className="calendar-date">
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
