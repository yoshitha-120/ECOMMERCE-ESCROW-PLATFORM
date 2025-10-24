import React from 'react';

function OrderFilters({ activeFilter, setActiveFilter }) {
  const filters = [
    { value: 'all', label: 'All Orders' },
    { value: '0', label: 'Created' },
    { value: '1', label: 'Shipped' },
    { value: '2', label: 'Delivered' },
    { value: '3', label: 'Completed' },
    { value: '4', label: 'Cancelled' }
  ];

  return (
    <div className="order-filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-button ${activeFilter === filter.value ? 'active' : ''}`}
          onClick={() => setActiveFilter(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default OrderFilters;

