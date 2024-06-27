import React from 'react';

const StatusIndicator = ({ status }) => {
  const getColor = (status) => {
    switch (status) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return <span className={`inline-block w-4 h-4 rounded-full ${getColor(status)}`} />;
};

export default StatusIndicator;
