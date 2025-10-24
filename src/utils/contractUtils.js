// utils/contractUtils.js
import { ethers } from 'ethers';
import contractABI from '../contractABI';

// Function to get contract instance
export const getContractInstance = async (contractAddress, signer) => {
  try {
    return new ethers.Contract(contractAddress, contractABI, signer);
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
};

// Format order status to human-readable text
export const getOrderStatusText = (statusCode) => {
  const statuses = ['Created', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];
  return statuses[statusCode] || 'Unknown';
};

// Format timestamp to human-readable date
export const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'Not available';
  return new Date(timestamp * 1000).toLocaleString();
};

// Check if delivery is on time (within 48 hours)
export const isDeliveryOnTime = (purchaseTime, deliveryTime) => {
  if (!purchaseTime || !deliveryTime || deliveryTime === 0) return false;
  
  const purchaseDate = new Date(purchaseTime * 1000);
  const deliveryDate = new Date(deliveryTime * 1000);
  const timeDiff = Math.abs(deliveryDate - purchaseDate);
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  
  return hoursDiff <= 48;
};

// Format Ethereum address for display
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format Ether value with 4 decimals
export const formatEther = (value) => {
  if (!value) return '0';
  return parseFloat(ethers.utils.formatEther(value)).toFixed(4);
};

// Helper function to listen for contract events
export const listenForContractEvents = (contract, callback) => {
  if (!contract) return;
  
  // Listen for OrderCreated events
  contract.on('OrderCreated', (orderId, consumer, producer, productId, purchaseTime) => {
    callback({
      type: 'OrderCreated',
      orderId: orderId.toString(),
      consumer,
      producer,
      productId: productId.toString(),
      purchaseTime: purchaseTime.toString()
    });
  });
  
  // Listen for OrderShipped events
  contract.on('OrderShipped', (orderId, shippedTime) => {
    callback({
      type: 'OrderShipped',
      orderId: orderId.toString(),
      shippedTime: shippedTime.toString()
    });
  });
  
  // Listen for OrderDelivered events
  contract.on('OrderDelivered', (orderId, deliveryTime) => {
    callback({
      type: 'OrderDelivered',
      orderId: orderId.toString(),
      deliveryTime: deliveryTime.toString()
    });
  });
  
  // Listen for PaymentReleased events
  contract.on('PaymentReleased', (orderId, amount) => {
    callback({
      type: 'PaymentReleased',
      orderId: orderId.toString(),
      amount: ethers.utils.formatEther(amount)
    });
  });
  
  // Listen for OrderCancelled events
  contract.on('OrderCancelled', (orderId) => {
    callback({
      type: 'OrderCancelled',
      orderId: orderId.toString()
    });
  });
  
  // Return a function to remove all listeners
  return () => {
    contract.removeAllListeners();
  };
};