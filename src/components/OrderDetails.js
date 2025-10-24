// components/OrderDetails.js
import React from 'react';

function OrderDetails({
  order,
  isConsumer,
  isProducer,
  onConfirmShipment,
  onConfirmDelivery,
  onCancelOrder,
  onSpecifyDeliveryDate // Added function for specifying delivery date
}) {
  const getOrderTimeline = () => {
    const timeline = [
      {
        status: 'Created',
        completed: true,
        time: order.purchaseTime
      },
      {
        status: 'Shipped',
        completed: ['Shipped', 'Delivered', 'Completed'].includes(order.status),
        time: order.status === 'Created' ? 'Pending' : 'Confirmed'
      },
      {
        status: 'Delivered',
        completed: ['Delivered', 'Completed'].includes(order.status),
        time: !['Delivered', 'Completed'].includes(order.status) ? 'Pending' : order.deliveryTime
      },
      {
        status: 'Completed',
        completed: order.status === 'Completed',
        time: order.status !== 'Completed' ? 'Pending' : 'Completed'
      }
    ];

    return timeline;
  };

  const getActionButtons = () => {
    if (order.status === 'Cancelled') {
      return <p className="order-cancelled">This order has been cancelled.</p>;
    }

    if (order.status === 'Completed') {
      return <p className="order-completed">This order has been completed.</p>;
    }

    return (
      <div className="action-buttons">
        {isProducer && order.status === 'Created' && (
          <button 
            onClick={() => onConfirmShipment(order.id)}
            className="action-button ship-button"
          >
            Confirm Shipment
          </button>
        )}
        
        {isConsumer && order.status === 'Shipped' && (
          <button 
            onClick={() => onConfirmDelivery(order.id)}
            className="action-button deliver-button"
          >
            Confirm Delivery
          </button>
        )}
        
        {isConsumer && order.status === 'Created' && (
          <button 
            onClick={() => onCancelOrder(order.id)}
            className="action-button cancel-button"
          >
            Cancel Order
          </button>
        )}

        {isConsumer && (order.status === 'Created' || order.status === 'Shipped') && (
          <button 
            onClick={() => {
              const deliveryDate = prompt("Enter the delivery date as a UNIX timestamp:");
              onSpecifyDeliveryDate(order.id, deliveryDate);
            }}
            className="action-button specify-delivery-button"
          >
            Specify Delivery Date
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="order-details">
      <h2>Order Details</h2>
      
      <div className="order-header">
        <div className="order-id">
          <span>Order ID: {order.id}</span>
        </div>
        <div className="order-status">
          <span className={`status status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="order-info">
        <div className="info-group">
          <label>Product:</label>
          <p>{order.productName} (ID: {order.productId})</p>
        </div>
        
        <div className="info-group">
          <label>Price:</label>
          <p>{order.productPrice} ETH</p>
        </div>
        
        <div className="info-group">
          <label>Consumer:</label>
          <p>{order.consumer}</p>
        </div>
        
        <div className="info-group">
          <label>Producer:</label>
          <p>{order.producer}</p>
        </div>
        
        <div className="info-group">
          <label>Purchase Time:</label>
          <p>{order.purchaseTime}</p>
        </div>
        
        <div className="info-group">
          <label>Delivery Time:</label>
          <p>{order.deliveryTime}</p>
        </div>
      </div>
      
      <div className="order-timeline">
        <h3>Order Timeline</h3>
        <div className="timeline">
          {getOrderTimeline().map((step, index) => (
            <div key={index} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
              <div className="step-indicator"></div>
              <div className="step-content">
                <h4>{step.status}</h4>
                <p>{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="order-actions">
        <h3>Actions</h3>
        {getActionButtons()}
      </div>
    </div>
  );
}

export default OrderDetails;
