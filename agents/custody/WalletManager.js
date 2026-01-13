/**
 * Wallet Manager
 * 
 * Implements self-custody wallet infrastructure for DAC agents.
 * Provides secure key management, HD wallet generation, and multi-signature support.
 * 
 * Aligns with Phase 1.1.2: Week 5 - Wallet Infrastructure
 */

import { Wallet, HDNodeWallet, Mnemonic, ethers } from 'ethers';
import { EventEmitter } from 'eventemitter3';
import crypto from 'crypto';

/**
 * Wallet Types
 */
export const WalletType = {
  HD: 'hd',              // Hierarchical Deterministic
  SIMPLE: 'simple',      // Simple key pair
  MULTISIG: 'multisig'   // Multi-signature
};

/**
 * Wallet Manager Class
 * 
 * Manages wallets for DAC agents with:
 * - HD wallet generation (BIP-39/BIP-44)
 * - Secure key storage with encryption
 * - Key rotation mechanisms
 * - Multi-signature wallet support
 */
export class WalletManager extends EventEmitter {
  /**
   * Create a new Wallet Manager
   * 
   * @param {Object} config - Wallet manager configuration
   * @param {string} [config.encryptionKey] - Master encryption key for wallet storage
   * @param {string} [config.derivationPath] - Default HD derivation path
   */
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      derivationPath: config.derivationPath || "m/44'/60'/0'/0", // Ethereum standard
      encryptionKey: config.encryptionKey || this._generateEncryptionKey(),
      ...config
    };
    
    // Storage
    this.wallets = new Map(); // walletId -> wallet info
    this.agentWallets = new Map(); // agentId -> Set of walletIds
    
    // Statistics
    this.stats = {
      totalWallets: 0,
      hdWallets: 0,
      simpleWallets: 0,
      multisigWallets: 0
    };
  }

  /**
   * Create a new HD wallet with mnemonic
   * 
   * @param {Object} params - Wallet creation parameters
   * @param {string} params.agentId - Agent ID that owns this wallet
   * @param {string} [params.mnemonic] - Optional mnemonic (generated if not provided)
   * @param {string} [params.password] - Optional password for encryption
   * @param {number} [params.accountIndex] - HD account index (default: 0)
   * @returns {Object} Wallet information
   */
  createHDWallet(params) {
    const { agentId, mnemonic, password, accountIndex = 0 } = params;
    
    // Generate or use provided mnemonic
    const mnemonicObj = mnemonic 
      ? Mnemonic.fromPhrase(mnemonic)
      : Wallet.createRandom().mnemonic;
    
    // Derive wallet from mnemonic
    const path = `${this.config.derivationPath}/${accountIndex}`;
    const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, path);
    
    // Create wallet info
    const walletId = this._generateWalletId();
    const walletInfo = {
      walletId,
      agentId,
      type: WalletType.HD,
      address: wallet.address,
      publicKey: wallet.publicKey,
      derivationPath: path,
      accountIndex,
      createdAt: new Date().toISOString(),
      rotationCount: 0
    };
    
    // Store encrypted private key and mnemonic
    const encrypted = this._encryptWalletData({
      privateKey: wallet.privateKey,
      mnemonic: mnemonicObj.phrase
    }, password);
    
    walletInfo.encrypted = encrypted;
    
    // Store wallet
    this.wallets.set(walletId, walletInfo);
    this._linkAgentToWallet(agentId, walletId);
    
    // Update statistics
    this.stats.totalWallets++;
    this.stats.hdWallets++;
    
    this.emit('walletCreated', { walletId, agentId, type: WalletType.HD });
    
    return {
      walletId,
      address: walletInfo.address,
      publicKey: walletInfo.publicKey,
      mnemonic: mnemonicObj.phrase, // Return once for backup
      derivationPath: path
    };
  }

  /**
   * Create a simple wallet (single key pair)
   * 
   * @param {Object} params - Wallet creation parameters
   * @param {string} params.agentId - Agent ID that owns this wallet
   * @param {string} [params.privateKey] - Optional private key (generated if not provided)
   * @param {string} [params.password] - Optional password for encryption
   * @returns {Object} Wallet information
   */
  createSimpleWallet(params) {
    const { agentId, privateKey, password } = params;
    
    // Generate or use provided private key
    const wallet = privateKey 
      ? new Wallet(privateKey)
      : Wallet.createRandom();
    
    // Create wallet info
    const walletId = this._generateWalletId();
    const walletInfo = {
      walletId,
      agentId,
      type: WalletType.SIMPLE,
      address: wallet.address,
      publicKey: wallet.publicKey,
      createdAt: new Date().toISOString(),
      rotationCount: 0
    };
    
    // Store encrypted private key
    const encrypted = this._encryptWalletData({
      privateKey: wallet.privateKey
    }, password);
    
    walletInfo.encrypted = encrypted;
    
    // Store wallet
    this.wallets.set(walletId, walletInfo);
    this._linkAgentToWallet(agentId, walletId);
    
    // Update statistics
    this.stats.totalWallets++;
    this.stats.simpleWallets++;
    
    this.emit('walletCreated', { walletId, agentId, type: WalletType.SIMPLE });
    
    return {
      walletId,
      address: walletInfo.address,
      publicKey: walletInfo.publicKey,
      privateKey: wallet.privateKey // Return once for backup
    };
  }

  /**
   * Create a multi-signature wallet configuration
   * 
   * @param {Object} params - Multi-sig wallet parameters
   * @param {string} params.agentId - Agent ID that owns this wallet
   * @param {Array<string>} params.signers - Array of signer addresses
   * @param {number} params.threshold - Number of required signatures
   * @param {string} [params.contractAddress] - Deployed multi-sig contract address
   * @returns {Object} Multi-sig wallet information
   */
  createMultiSigWallet(params) {
    const { agentId, signers, threshold, contractAddress } = params;
    
    // Validate parameters
    if (!signers || signers.length < 2) {
      throw new Error('Multi-sig wallet requires at least 2 signers');
    }
    
    if (threshold < 1 || threshold > signers.length) {
      throw new Error('Invalid threshold value');
    }
    
    // Create wallet info
    const walletId = this._generateWalletId();
    const walletInfo = {
      walletId,
      agentId,
      type: WalletType.MULTISIG,
      signers: signers.sort(), // Sort for deterministic order
      threshold,
      contractAddress: contractAddress || null,
      createdAt: new Date().toISOString()
    };
    
    // Store wallet
    this.wallets.set(walletId, walletInfo);
    this._linkAgentToWallet(agentId, walletId);
    
    // Update statistics
    this.stats.totalWallets++;
    this.stats.multisigWallets++;
    
    this.emit('walletCreated', { walletId, agentId, type: WalletType.MULTISIG });
    
    return {
      walletId,
      signers: walletInfo.signers,
      threshold,
      contractAddress
    };
  }

  /**
   * Get wallet information
   * 
   * @param {string} walletId - Wallet ID
   * @returns {Object|null} Wallet information (without sensitive data)
   */
  getWallet(walletId) {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return null;
    
    // Return safe copy without encrypted data
    const { encrypted, ...safeWallet } = wallet;
    return safeWallet;
  }

  /**
   * Get all wallets for an agent
   * 
   * @param {string} agentId - Agent ID
   * @returns {Array<Object>} Array of wallet information
   */
  getAgentWallets(agentId) {
    const walletIds = this.agentWallets.get(agentId);
    if (!walletIds) return [];
    
    return Array.from(walletIds)
      .map(id => this.getWallet(id))
      .filter(wallet => wallet !== null);
  }

  /**
   * Decrypt and get wallet instance for signing
   * 
   * @param {string} walletId - Wallet ID
   * @param {string} [password] - Decryption password if set
   * @returns {Wallet} Ethers Wallet instance
   */
  getWalletForSigning(walletId, password) {
    const walletInfo = this.wallets.get(walletId);
    if (!walletInfo) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    if (walletInfo.type === WalletType.MULTISIG) {
      throw new Error('Cannot get signing wallet for multi-sig wallet');
    }
    
    // Decrypt wallet data
    const decrypted = this._decryptWalletData(walletInfo.encrypted, password);
    
    // Return wallet instance
    return new Wallet(decrypted.privateKey);
  }

  /**
   * Get decrypted wallet data (for backup/recovery use)
   * 
   * @param {string} walletId - Wallet ID
   * @param {string} [password] - Decryption password if set
   * @returns {Object} Decrypted wallet data
   */
  getDecryptedWalletData(walletId, password) {
    const walletInfo = this.wallets.get(walletId);
    if (!walletInfo) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    if (walletInfo.type === WalletType.MULTISIG) {
      throw new Error('Cannot decrypt multi-sig wallet');
    }
    
    // Decrypt wallet data
    return this._decryptWalletData(walletInfo.encrypted, password);
  }

  /**
   * Get wallet info including encrypted data (for backup purposes)
   * INTERNAL USE ONLY - For BackupRecoveryManager
   * 
   * @param {string} walletId - Wallet ID
   * @returns {Object} Wallet info with encrypted data
   */
  getWalletForBackup(walletId) {
    const walletInfo = this.wallets.get(walletId);
    if (!walletInfo) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    return walletInfo;
  }

  /**
   * Rotate wallet keys (create new key, maintain old for transition period)
   * 
   * @param {string} walletId - Wallet ID to rotate
   * @param {string} [password] - Current password
   * @returns {Object} New wallet information
   */
  async rotateKeys(walletId, password) {
    const oldWallet = this.wallets.get(walletId);
    if (!oldWallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    if (oldWallet.type === WalletType.MULTISIG) {
      throw new Error('Cannot rotate multi-sig wallet keys automatically');
    }
    
    // Decrypt old wallet
    const decrypted = this._decryptWalletData(oldWallet.encrypted, password);
    
    let newWallet;
    if (oldWallet.type === WalletType.HD) {
      // For HD wallets, increment account index
      const newAccountIndex = oldWallet.accountIndex + 1;
      const path = `${this.config.derivationPath}/${newAccountIndex}`;
      const mnemonic = Mnemonic.fromPhrase(decrypted.mnemonic);
      newWallet = HDNodeWallet.fromMnemonic(mnemonic, path);
      
      oldWallet.accountIndex = newAccountIndex;
      oldWallet.derivationPath = path;
    } else {
      // For simple wallets, create new random wallet
      newWallet = Wallet.createRandom();
    }
    
    // Update wallet info
    oldWallet.address = newWallet.address;
    oldWallet.publicKey = newWallet.publicKey;
    oldWallet.rotationCount++;
    oldWallet.lastRotation = new Date().toISOString();
    
    // Re-encrypt with new keys
    const toEncrypt = oldWallet.type === WalletType.HD
      ? { privateKey: newWallet.privateKey, mnemonic: decrypted.mnemonic }
      : { privateKey: newWallet.privateKey };
    
    oldWallet.encrypted = this._encryptWalletData(toEncrypt, password);
    
    this.emit('keyRotation', { walletId, newAddress: newWallet.address });
    
    return {
      walletId,
      address: newWallet.address,
      publicKey: newWallet.publicKey,
      rotationCount: oldWallet.rotationCount
    };
  }

  /**
   * Remove a wallet (CAUTION: This will delete the wallet permanently)
   * 
   * @param {string} walletId - Wallet ID to remove
   * @returns {boolean} True if removed
   */
  removeWallet(walletId) {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return false;
    
    // Remove from agent wallet mapping
    const agentWallets = this.agentWallets.get(wallet.agentId);
    if (agentWallets) {
      agentWallets.delete(walletId);
    }
    
    // Remove wallet
    this.wallets.delete(walletId);
    
    // Update statistics
    this.stats.totalWallets--;
    if (wallet.type === WalletType.HD) this.stats.hdWallets--;
    else if (wallet.type === WalletType.SIMPLE) this.stats.simpleWallets--;
    else if (wallet.type === WalletType.MULTISIG) this.stats.multisigWallets--;
    
    this.emit('walletRemoved', { walletId, agentId: wallet.agentId });
    
    return true;
  }

  /**
   * Get wallet manager statistics
   * 
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }

  // Private methods

  /**
   * Generate a unique wallet ID
   * @private
   */
  _generateWalletId() {
    return `wallet-${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate an encryption key
   * @private
   */
  _generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Link an agent to a wallet
   * @private
   */
  _linkAgentToWallet(agentId, walletId) {
    if (!this.agentWallets.has(agentId)) {
      this.agentWallets.set(agentId, new Set());
    }
    this.agentWallets.get(agentId).add(walletId);
  }

  /**
   * Encrypt wallet data
   * @private
   */
  _encryptWalletData(data, password) {
    // Generate unique salt for each encryption
    const salt = crypto.randomBytes(32);
    
    const key = password 
      ? crypto.scryptSync(password, salt, 32)
      : Buffer.from(this.config.encryptionKey, 'hex');
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const dataStr = JSON.stringify(data);
    let encrypted = cipher.update(dataStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex'),
      hasPassword: !!password
    };
  }

  /**
   * Decrypt wallet data
   * @private
   */
  _decryptWalletData(encryptedData, password) {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    
    const key = encryptedData.hasPassword && password
      ? crypto.scryptSync(password, salt, 32)
      : Buffer.from(this.config.encryptionKey, 'hex');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}

export default WalletManager;
