// context/EthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractABI from '../contractABI';

// Contract address would be replaced with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const EthContext = createContext();

export const EthProvider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize provider, signer, contract
  const initialize = useCallback(async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        
        // Get network ID
        const network = await provider.getNetwork();
        setNetworkId(network.chainId);
        
        // Get connected accounts
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const signer = provider.getSigner();
          setSigner(signer);
          
          // Initialize contract
          const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
          setContract(contract);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Failed to initialize Ethereum connection");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Ethereum browser extension not detected");
      setLoading(false);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        setError(null);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Re-initialize after connecting
        await initialize();
      } catch (error) {
        console.error("Connection error:", error);
        setError("Failed to connect wallet");
        setLoading(false);
      }
    } else {
      setError("Ethereum browser extension not detected");
      setLoading(false);
    }
  };

  // Handle account or network changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0 && accounts[0] !== account) {
      setAccount(accounts[0]);
      initialize();
    } else if (accounts.length === 0) {
      setAccount('');
      setSigner(null);
      setContract(null);
    }
  };

  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload();
  };

  // Set up event listeners
  useEffect(() => {
    initialize();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [initialize]);

  const value = {
    account,
    contract,
    provider,
    signer,
    networkId,
    loading,
    error,
    connectWallet
  };

  return <EthContext.Provider value={value}>{children}</EthContext.Provider>;
};