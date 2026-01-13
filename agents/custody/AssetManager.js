/**
 * Asset Manager
 * 
 * Manages asset tracking and balance monitoring for DAC agent wallets.
 * Supports multiple asset types including tokens, NFTs, and native currencies.
 * 
 * Aligns with Phase 1.1.2: Week 6 - Asset Management
 */

import { EventEmitter } from 'eventemitter3';
import { ethers } from 'ethers';

/**
 * Asset Types
 */
export const AssetType = {
  NATIVE: 'native',      // Native blockchain currency (ETH, etc.)
  ERC20: 'erc20',        // ERC-20 tokens (ASI, stakedASI, etc.)
  ERC721: 'erc721',      // NFTs (ERC-721)
  ERC1155: 'erc1155'     // Multi-token standard
};

/**
 * Transaction Status
 */
export const TransactionStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

/**
 * Asset Manager Class
 * 
 * Provides asset tracking and management with:
 * - Balance monitoring across multiple asset types
 * - Transaction tracking and history
 * - Asset transfer protocols between agents
 * - Support for ASI, stakedASI, NFTs, and more
 */
export class AssetManager extends EventEmitter {
  /**
   * Create a new Asset Manager
   * 
   * @param {Object} config - Asset manager configuration
   * @param {WalletManager} config.walletManager - Wallet manager instance
   * @param {Object} [config.provider] - Blockchain provider
   * @param {number} [config.refreshInterval] - Balance refresh interval in ms
   */
  constructor(config = {}) {
    super();
    
    if (!config.walletManager) {
      throw new Error('AssetManager requires a WalletManager instance');
    }
    
    this.walletManager = config.walletManager;
    
    // Configuration
    this.config = {
      refreshInterval: config.refreshInterval || 60000, // 1 minute
      provider: config.provider || null,
      ...config
    };
    
    // Storage
    this.balances = new Map(); // walletId -> Map of assetId -> balance
    this.assets = new Map(); // assetId -> asset metadata
    this.transactions = new Map(); // txId -> transaction data
    this.walletTransactions = new Map(); // walletId -> Set of txIds
    
    // Statistics
    this.stats = {
      totalAssets: 0,
      totalTransactions: 0,
      pendingTransactions: 0
    };
    
    // Start balance refresh if provider is available
    if (this.config.provider) {
      this._startBalanceRefresh();
    }
  }

  /**
   * Register an asset for tracking
   * 
   * @param {Object} assetInfo - Asset information
   * @param {string} assetInfo.symbol - Asset symbol (e.g., 'ASI', 'ETH')
   * @param {string} assetInfo.name - Asset name
   * @param {string} assetInfo.type - Asset type
   * @param {string} [assetInfo.contractAddress] - Contract address for tokens
   * @param {number} [assetInfo.decimals] - Token decimals (default: 18)
   * @returns {string} Asset ID
   */
  registerAsset(assetInfo) {
    const { symbol, name, type, contractAddress, decimals = 18 } = assetInfo;
    
    // Create asset ID
    const assetId = type === AssetType.NATIVE 
      ? `native-${symbol.toLowerCase()}`
      : `${type}-${contractAddress.toLowerCase()}`;
    
    // Store asset info
    this.assets.set(assetId, {
      assetId,
      symbol,
      name,
      type,
      contractAddress: contractAddress || null,
      decimals,
      registeredAt: new Date().toISOString()
    });
    
    this.stats.totalAssets++;
    this.emit('assetRegistered', { assetId, symbol, name });
    
    return assetId;
  }

  /**
   * Get balance for a wallet and asset
   * 
   * @param {string} walletId - Wallet ID
   * @param {string} assetId - Asset ID
   * @returns {string} Balance as string (to avoid precision issues)
   */
  getBalance(walletId, assetId) {
    const walletBalances = this.balances.get(walletId);
    if (!walletBalances) return '0';
    
    return walletBalances.get(assetId) || '0';
  }

  /**
   * Get all balances for a wallet
   * 
   * @param {string} walletId - Wallet ID
   * @returns {Object} Map of assetId to balance
   */
  getAllBalances(walletId) {
    const walletBalances = this.balances.get(walletId);
    if (!walletBalances) return {};
    
    const result = {};
    for (const [assetId, balance] of walletBalances) {
      const asset = this.assets.get(assetId);
      result[assetId] = {
        balance,
        asset: asset ? { symbol: asset.symbol, name: asset.name, type: asset.type } : null
      };
    }
    
    return result;
  }

  /**
   * Update balance for a wallet and asset
   * 
   * @param {string} walletId - Wallet ID
   * @param {string} assetId - Asset ID
   * @param {string} balance - New balance
   */
  updateBalance(walletId, assetId, balance) {
    if (!this.balances.has(walletId)) {
      this.balances.set(walletId, new Map());
    }
    
    const walletBalances = this.balances.get(walletId);
    const oldBalance = walletBalances.get(assetId) || '0';
    
    walletBalances.set(assetId, balance);
    
    this.emit('balanceUpdate', {
      walletId,
      assetId,
      oldBalance,
      newBalance: balance
    });
  }

  /**
   * Refresh balance from blockchain
   * 
   * @param {string} walletId - Wallet ID
   * @param {string} assetId - Asset ID
   * @returns {Promise<string>} Updated balance
   */
  async refreshBalance(walletId, assetId) {
    if (!this.config.provider) {
      throw new Error('Provider not configured');
    }
    
    const wallet = this.walletManager.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset ${assetId} not registered`);
    }
    
    let balance;
    
    if (asset.type === AssetType.NATIVE) {
      // Get native balance
      const balanceWei = await this.config.provider.getBalance(wallet.address);
      balance = ethers.formatEther(balanceWei);
    } else if (asset.type === AssetType.ERC20) {
      // Get ERC-20 token balance
      const tokenContract = new ethers.Contract(
        asset.contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.config.provider
      );
      const balanceWei = await tokenContract.balanceOf(wallet.address);
      balance = ethers.formatUnits(balanceWei, asset.decimals);
    } else {
      // NFT balance tracking would require different logic
      balance = '0';
    }
    
    this.updateBalance(walletId, assetId, balance);
    
    return balance;
  }

  /**
   * Record a transaction
   * 
   * @param {Object} txInfo - Transaction information
   * @param {string} txInfo.walletId - Wallet ID
   * @param {string} txInfo.assetId - Asset ID
   * @param {string} txInfo.type - Transaction type ('send', 'receive')
   * @param {string} txInfo.amount - Transaction amount
   * @param {string} txInfo.to - Recipient address
   * @param {string} [txInfo.from] - Sender address
   * @param {string} [txInfo.txHash] - Transaction hash
   * @param {string} [txInfo.status] - Transaction status
   * @returns {string} Transaction ID
   */
  recordTransaction(txInfo) {
    const {
      walletId,
      assetId,
      type,
      amount,
      to,
      from,
      txHash,
      status = TransactionStatus.PENDING
    } = txInfo;
    
    // Generate transaction ID
    const txId = txHash || `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create transaction record
    const transaction = {
      txId,
      walletId,
      assetId,
      type,
      amount,
      to,
      from,
      txHash,
      status,
      timestamp: new Date().toISOString()
    };
    
    // Store transaction
    this.transactions.set(txId, transaction);
    
    // Link to wallet
    if (!this.walletTransactions.has(walletId)) {
      this.walletTransactions.set(walletId, new Set());
    }
    this.walletTransactions.get(walletId).add(txId);
    
    // Update statistics
    this.stats.totalTransactions++;
    if (status === TransactionStatus.PENDING) {
      this.stats.pendingTransactions++;
    }
    
    this.emit('transactionRecorded', transaction);
    
    return txId;
  }

  /**
   * Update transaction status
   * 
   * @param {string} txId - Transaction ID
   * @param {string} status - New status
   * @param {string} [txHash] - Transaction hash if now available
   */
  updateTransactionStatus(txId, status, txHash) {
    const transaction = this.transactions.get(txId);
    if (!transaction) {
      throw new Error(`Transaction ${txId} not found`);
    }
    
    const oldStatus = transaction.status;
    transaction.status = status;
    
    if (txHash && !transaction.txHash) {
      transaction.txHash = txHash;
    }
    
    // Update statistics
    if (oldStatus === TransactionStatus.PENDING && status !== TransactionStatus.PENDING) {
      this.stats.pendingTransactions--;
    }
    
    this.emit('transactionStatusUpdate', {
      txId,
      oldStatus,
      newStatus: status,
      txHash: transaction.txHash
    });
  }

  /**
   * Get transaction by ID
   * 
   * @param {string} txId - Transaction ID
   * @returns {Object|null} Transaction data
   */
  getTransaction(txId) {
    return this.transactions.get(txId) || null;
  }

  /**
   * Get all transactions for a wallet
   * 
   * @param {string} walletId - Wallet ID
   * @param {Object} [filters] - Optional filters
   * @returns {Array<Object>} Array of transactions
   */
  getWalletTransactions(walletId, filters = {}) {
    const txIds = this.walletTransactions.get(walletId);
    if (!txIds) return [];
    
    let transactions = Array.from(txIds)
      .map(id => this.transactions.get(id))
      .filter(tx => tx !== undefined);
    
    // Apply filters
    if (filters.type) {
      transactions = transactions.filter(tx => tx.type === filters.type);
    }
    
    if (filters.status) {
      transactions = transactions.filter(tx => tx.status === filters.status);
    }
    
    if (filters.assetId) {
      transactions = transactions.filter(tx => tx.assetId === filters.assetId);
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return transactions;
  }

  /**
   * Get asset information
   * 
   * @param {string} assetId - Asset ID
   * @returns {Object|null} Asset information
   */
  getAsset(assetId) {
    return this.assets.get(assetId) || null;
  }

  /**
   * Get all registered assets
   * 
   * @returns {Array<Object>} Array of asset information
   */
  getAllAssets() {
    return Array.from(this.assets.values());
  }

  /**
   * Create asset transfer between agents
   * 
   * @param {Object} params - Transfer parameters
   * @param {string} params.fromWalletId - Source wallet ID
   * @param {string} params.toAddress - Destination address
   * @param {string} params.assetId - Asset ID to transfer
   * @param {string} params.amount - Amount to transfer
   * @param {string} [params.password] - Wallet password if required
   * @returns {Promise<string>} Transaction ID
   */
  async transfer(params) {
    const { fromWalletId, toAddress, assetId, amount, password } = params;
    
    if (!this.config.provider) {
      throw new Error('Provider not configured');
    }
    
    // Get wallet for signing
    const wallet = this.walletManager.getWalletForSigning(fromWalletId, password);
    const connectedWallet = wallet.connect(this.config.provider);
    
    // Get asset info
    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset ${assetId} not registered`);
    }
    
    // Record pending transaction
    const txId = this.recordTransaction({
      walletId: fromWalletId,
      assetId,
      type: 'send',
      amount,
      to: toAddress,
      from: wallet.address,
      status: TransactionStatus.PENDING
    });
    
    try {
      let tx;
      
      if (asset.type === AssetType.NATIVE) {
        // Send native currency
        tx = await connectedWallet.sendTransaction({
          to: toAddress,
          value: ethers.parseEther(amount)
        });
      } else if (asset.type === AssetType.ERC20) {
        // Send ERC-20 token
        const tokenContract = new ethers.Contract(
          asset.contractAddress,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          connectedWallet
        );
        tx = await tokenContract.transfer(
          toAddress,
          ethers.parseUnits(amount, asset.decimals)
        );
      } else {
        throw new Error(`Transfer not supported for asset type ${asset.type}`);
      }
      
      // Update transaction with hash
      this.updateTransactionStatus(txId, TransactionStatus.PENDING, tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        this.updateTransactionStatus(txId, TransactionStatus.CONFIRMED);
        // Refresh balance after successful transfer
        await this.refreshBalance(fromWalletId, assetId);
      } else {
        this.updateTransactionStatus(txId, TransactionStatus.FAILED);
      }
      
      return txId;
    } catch (error) {
      this.updateTransactionStatus(txId, TransactionStatus.FAILED);
      throw error;
    }
  }

  /**
   * Get asset manager statistics
   * 
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Shutdown the asset manager
   */
  async shutdown() {
    this._stopBalanceRefresh();
    this.emit('shutdown');
  }

  // Private methods

  /**
   * Start automatic balance refresh
   * @private
   */
  _startBalanceRefresh() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }
    
    this._refreshTimer = setInterval(() => {
      this._refreshAllBalances().catch(err => {
        this.emit('error', { type: 'balance-refresh', error: err.message });
      });
    }, this.config.refreshInterval);
  }

  /**
   * Stop balance refresh
   * @private
   */
  _stopBalanceRefresh() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  /**
   * Refresh all balances
   * @private
   */
  async _refreshAllBalances() {
    for (const [walletId] of this.balances) {
      const wallet = this.walletManager.getWallet(walletId);
      if (!wallet) continue;
      
      for (const asset of this.assets.values()) {
        try {
          await this.refreshBalance(walletId, asset.assetId);
        } catch (error) {
          // Continue on error
        }
      }
    }
  }
}

export default AssetManager;
