import React from 'react';

const Calendar = () => {
  const dates = [...Array(31).keys()].map(i => i + 1);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <span>Janeiro 2024</span>
        <div className="flex space-x-2">
          <button className="bg-gray-700 p-2 rounded">{'<'}</button>
          <button className="bg-gray-700 p-2 rounded">{'>'}</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {dates.map(date => (
          <div key={date} className="bg-gray-700 p-2 text-center rounded">
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
