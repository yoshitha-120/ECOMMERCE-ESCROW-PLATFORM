// App.js - Main application component
import React, { useState, useEffect } from 'react';
import { 
  BrowserProvider, 
  Contract, 
  formatEther, 
  parseEther 
} from "ethers";

import './App.css';
import ConnectWallet from './components/ConnectWallet';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails'; // Fixed import name
import contractABI from './contractABI';

// Contract address would be replaced with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProducer, setIsProducer] = useState(false);
  const [isConsumer, setIsConsumer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Initialize ethers provider correctly for v6
          const provider = new BrowserProvider(window.ethereum);
          setProvider(provider);

          // Get connected accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const signer = await provider.getSigner();
            setSigner(signer);
            
            // Initialize contract
            const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
            setContract(contract);
            
            // Load orders
            await loadOrders(contract, accounts[0]);
          }
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (contract && account) {
      loadOrders(contract, account);
    }
  }, [contract, account]);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        setProvider(provider);
        
        setAccount(accounts[0]);
        
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);
        setContract(contract);
        
        await loadOrders(contract, accounts[0]);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const loadOrders = async (contract, userAddress) => {
    try {
      const orderCount = await contract.orderCount();
      const ordersArray = [];
      
      for (let i = 0; i < orderCount; i++) {
        const order = await contract.orders(i);
        
        // Check if the current user is either the consumer or producer
        const isConsumer = order.consumer.toLowerCase() === userAddress.toLowerCase();
        const isProducer = order.producer.toLowerCase() === userAddress.toLowerCase();
        
        if (isConsumer || isProducer) {
          ordersArray.push({
            id: i,
            consumer: order.consumer,
            producer: order.producer,
            productId: order.productId.toString(),
            productName: order.productName,
            productPrice: formatEther(order.productPrice),
            purchaseTime: new Date(Number(order.purchaseTime) * 1000).toLocaleString(),
            deliveryTime: Number(order.deliveryTime) === 0 ? 
              'Not delivered yet' : 
              new Date(Number(order.deliveryTime) * 1000).toLocaleString(),
            status: getOrderStatusText(order.status),
            consumerConfirmedDelivery: order.consumerConfirmedDelivery,
            producerConfirmedShipment: order.producerConfirmedShipment,
            isConsumer,
            isProducer
          });
        }
      }
      
      setOrders(ordersArray);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const getOrderStatusText = (statusCode) => {
    const statuses = ['Created', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];
    return statuses[Number(statusCode)] || 'Unknown';
  };

  const handleCreateOrder = async (producerAddress, productId, productName, productPrice) => {
    try {
      setLoading(true);
      const priceInWei = parseEther(productPrice);
      
      const tx = await contract.createOrder(
        producerAddress,
        productId,
        productName,
        priceInWei,
        { value: priceInWei }
      );
      
      await tx.wait();
      await loadOrders(contract, account);
      setLoading(false);
    } catch (error) {
      console.error("Create order error:", error);
      setLoading(false);
    }
  };

  const handleConfirmShipment = async (orderId) => {
    try {
      setLoading(true);
      const tx = await contract.confirmShipment(orderId);
      await tx.wait();
      await loadOrders(contract, account);
      setLoading(false);
    } catch (error) {
      console.error("Confirm shipment error:", error);
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      setLoading(true);
      const tx = await contract.confirmDelivery(orderId);
      await tx.wait();
      await loadOrders(contract, account);
      setLoading(false);
    } catch (error) {
      console.error("Confirm delivery error:", error);
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const tx = await contract.cancelOrder(orderId);
      await tx.wait();
      await loadOrders(contract, account);
      setLoading(false);
    } catch (error) {
      console.error("Cancel order error:", error);
      setLoading(false);
    }
  };

  const handleSpecifyDeliveryDate = async (orderId, deliveryDate) => {
    try {
      setLoading(true);
      const tx = await contract.specifyDeliveryDate(orderId, deliveryDate);
      await tx.wait();
      await loadOrders(contract, account);
      setLoading(false);
    } catch (error) {
      console.error("Specify delivery date error:", error);
      setLoading(false);
    }
  };

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setIsProducer(order.producer.toLowerCase() === account.toLowerCase());
    setIsConsumer(order.consumer.toLowerCase() === account.toLowerCase());
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ecommerce Escrow Platform</h1>
        <ConnectWallet 
          account={account} 
          connectWallet={connectWallet}
        />
      </header>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="app-container">
          {account ? (
            <>
              <div className="app-column">
                <h2>Create New Order</h2>
                <OrderForm onCreateOrder={handleCreateOrder} />
                
                <h2>Your Orders</h2>
                <OrderList
                  orders={orders}
                  onSelectOrder={selectOrder}
                />
              </div>
              
              <div className="app-column">
                {selectedOrder && (
                  <OrderDetails
                    order={selectedOrder}
                    isConsumer={isConsumer}
                    isProducer={isProducer}
                    onConfirmShipment={handleConfirmShipment}
                    onConfirmDelivery={handleConfirmDelivery}
                    onCancelOrder={handleCancelOrder}
                    onSpecifyDeliveryDate={handleSpecifyDeliveryDate} // Added support for delivery date
                  />
                )}
              </div>
            </>
          ) : (
            <div className="welcome-message">
              <h2>Welcome to the Ecommerce Escrow Platform</h2>
              <p>Please connect your wallet to continue.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
