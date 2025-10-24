// components/TransactionModal.js
import React, { useState, useEffect } from 'react';

function TransactionModal({ isOpen, onClose, title, transaction, onConfirm }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);
  
  const handleConfirm = async () => {
    setProcessing(true);
    setError('');
    
    try {
      await onConfirm();
      setSuccess(true);
      
      // Close after a short delay on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Transaction error:", error);
      setError(error.message || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="transaction-info">
            <p>{transaction.description}</p>
            
            {transaction.details && (
              <div className="transaction-details">
                {Object.entries(transaction.details).map(([key, value]) => (
                  <div key={key} className="detail-row">
                    <span className="detail-label">{key}:</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {success && (
            <div className="success-message">
              Transaction successful! Redirecting...
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          
          <button 
            className="confirm-button" 
            onClick={handleConfirm}
            disabled={processing || success}
          >
            {processing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionModal;