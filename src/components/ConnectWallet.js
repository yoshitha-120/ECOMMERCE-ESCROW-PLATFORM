import React from 'react';

function ConnectWallet({ account, connectWallet }) {
  return (
    <div className="wallet-connect">
      {account ? (
        <div className="wallet-info">
          <span>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
        </div>
      ) : (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ConnectWallet;