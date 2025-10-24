import React, { useState } from 'react';

function OrderForm({ onCreateOrder }) {
  const [producerAddress, setProducerAddress] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateOrder(producerAddress, productId, productName, productPrice);
    // Reset form
    setProducerAddress('');
    setProductId('');
    setProductName('');
    setProductPrice('');
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Producer Address:</label>
        <input
          type="text"
          value={producerAddress}
          onChange={(e) => setProducerAddress(e.target.value)}
          placeholder="0x..."
          required
        />
      </div>
      
      <div className="form-group">
        <label>Product ID:</label>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Product ID"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Product Name:</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Price (ETH):</label>
        <input
          type="text"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="0.01"
          required
        />
      </div>
      
      <button type="submit" className="submit-button">Create Order</button>
    </form>
  );
}

export default OrderForm;