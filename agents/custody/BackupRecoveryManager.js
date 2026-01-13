/**
 * Backup and Recovery Manager
 * 
 * Implements secure backup and recovery mechanisms for DAC agent wallets.
 * Provides social recovery, emergency access, and backup/restore functionality.
 * 
 * Aligns with Phase 1.1.2: Week 7 - Security & Recovery
 */

import { EventEmitter } from 'eventemitter3';
import crypto from 'crypto';

/**
 * Recovery Method Types
 */
export const RecoveryMethod = {
  MNEMONIC: 'mnemonic',
  SOCIAL: 'social',
  EMERGENCY: 'emergency'
};

/**
 * Backup Status
 */
export const BackupStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
  FAILED: 'failed'
};

/**
 * Backup and Recovery Manager Class
 * 
 * Manages wallet backup and recovery with:
 * - Encrypted backup creation and storage
 * - Social recovery with multiple guardians
 * - Emergency access protocols
 * - Backup verification and restoration
 */
export class BackupRecoveryManager extends EventEmitter {
  /**
   * Create a new Backup and Recovery Manager
   * 
   * @param {Object} config - Manager configuration
   * @param {WalletManager} config.walletManager - Wallet manager instance
   * @param {number} [config.minGuardians] - Minimum guardians for social recovery
   * @param {number} [config.guardianThreshold] - Guardian approval threshold
   */
  constructor(config = {}) {
    super();
    
    if (!config.walletManager) {
      throw new Error('BackupRecoveryManager requires a WalletManager instance');
    }
    
    this.walletManager = config.walletManager;
    
    // Configuration
    this.config = {
      minGuardians: config.minGuardians || 3,
      guardianThreshold: config.guardianThreshold || 2,
      emergencyDelayHours: config.emergencyDelayHours || 48,
      ...config
    };
    
    // Storage
    this.backups = new Map(); // walletId -> backup info
    this.socialRecovery = new Map(); // walletId -> social recovery config
    this.emergencyAccess = new Map(); // walletId -> emergency access config
    this.recoveryRequests = new Map(); // requestId -> recovery request
    
    // Statistics
    this.stats = {
      totalBackups: 0,
      verifiedBackups: 0,
      socialRecoveryConfigs: 0,
      recoveryRequests: 0
    };
  }

  /**
   * Create an encrypted backup of a wallet
   * 
   * @param {Object} params - Backup parameters
   * @param {string} params.walletId - Wallet ID to backup
   * @param {string} params.password - Backup encryption password
   * @param {string} [params.walletPassword] - Wallet decryption password if wallet is password-protected
   * @param {Object} [params.metadata] - Additional metadata to include
   * @returns {Object} Backup information
   */
  createBackup(params) {
    const { walletId, password, walletPassword, metadata = {} } = params;
    
    // Get wallet info
    const wallet = this.walletManager.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    try {
      // Decrypt wallet to get the actual keys
      const decryptedWallet = this.walletManager.getDecryptedWalletData(walletId, walletPassword);
      
      // Create backup data with decrypted keys
      const backupData = {
        walletId,
        type: wallet.type,
        address: wallet.address,
        publicKey: wallet.publicKey,
        derivationPath: wallet.derivationPath,
        // Store decrypted sensitive data
        privateKey: decryptedWallet.privateKey,
        mnemonic: decryptedWallet.mnemonic || null,
        metadata: {
          ...metadata,
          backupDate: new Date().toISOString(),
          backupVersion: '1.0'
        }
      };
      
      // Encrypt backup with user password
      const backupId = this._generateBackupId();
      const encryptedBackup = this._encryptBackup(backupData, password);
      
      // Store backup info
      const backupInfo = {
        backupId,
        walletId,
        address: wallet.address,
        status: BackupStatus.PENDING,
        createdAt: new Date().toISOString(),
        encrypted: encryptedBackup
      };
      
      this.backups.set(backupId, backupInfo);
      this.stats.totalBackups++;
      
      this.emit('backupCreated', { backupId, walletId });
      
      return {
        backupId,
        walletId,
        encryptedBackup: encryptedBackup.data // User should store this securely
      };
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Verify a backup
   * 
   * @param {string} backupId - Backup ID
   * @param {string} password - Backup password
   * @returns {boolean} True if backup is valid
   */
  verifyBackup(backupId, password) {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`);
    }
    
    try {
      // Attempt to decrypt
      const decrypted = this._decryptBackup(backup.encrypted, password);
      
      // Verify wallet ID matches
      if (decrypted.walletId !== backup.walletId) {
        throw new Error('Backup integrity check failed');
      }
      
      // Update status
      backup.status = BackupStatus.VERIFIED;
      backup.verifiedAt = new Date().toISOString();
      this.stats.verifiedBackups++;
      
      this.emit('backupVerified', { backupId });
      
      return true;
    } catch (error) {
      backup.status = BackupStatus.FAILED;
      throw new Error(`Backup verification failed: ${error.message}`);
    }
  }

  /**
   * Restore a wallet from backup
   * 
   * @param {Object} params - Restore parameters
   * @param {string} params.backupId - Backup ID
   * @param {string} params.password - Backup password
   * @param {string} params.agentId - Agent ID for restored wallet
   * @returns {Object} Restored wallet information
   */
  restoreFromBackup(params) {
    const { backupId, password, agentId } = params;
    
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`);
    }
    
    try {
      // Decrypt backup
      const backupData = this._decryptBackup(backup.encrypted, password);
      
      // Restore wallet based on type
      let restoredWallet;
      
      if (backupData.type === 'hd' && backupData.mnemonic) {
        // Restore HD wallet from mnemonic
        restoredWallet = this.walletManager.createHDWallet({
          agentId,
          mnemonic: backupData.mnemonic,
          accountIndex: backupData.derivationPath ? 
            parseInt(backupData.derivationPath.split('/').pop()) : 0
        });
      } else if (backupData.type === 'simple' && backupData.privateKey) {
        // Restore simple wallet from private key
        restoredWallet = this.walletManager.createSimpleWallet({
          agentId,
          privateKey: backupData.privateKey
        });
      } else {
        throw new Error(`Cannot restore wallet type: ${backupData.type} - missing required data`);
      }
      
      this.emit('walletRestored', {
        backupId,
        walletId: restoredWallet.walletId,
        address: restoredWallet.address
      });
      
      return restoredWallet;
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  /**
   * Configure social recovery for a wallet
   * 
   * @param {Object} params - Social recovery parameters
   * @param {string} params.walletId - Wallet ID
   * @param {Array<Object>} params.guardians - Array of guardian info
   * @param {number} [params.threshold] - Number of guardians required
   * @returns {string} Social recovery ID
   */
  configureSocialRecovery(params) {
    const {
      walletId,
      guardians,
      threshold = this.config.guardianThreshold
    } = params;
    
    // Validate
    if (guardians.length < this.config.minGuardians) {
      throw new Error(`Minimum ${this.config.minGuardians} guardians required`);
    }
    
    if (threshold < 1 || threshold > guardians.length) {
      throw new Error('Invalid threshold value');
    }
    
    // Get wallet
    const wallet = this.walletManager.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    // Create social recovery configuration
    const recoveryId = this._generateRecoveryId();
    const config = {
      recoveryId,
      walletId,
      guardians: guardians.map(g => ({
        address: g.address,
        name: g.name || 'Guardian',
        contact: g.contact || null,
        publicKey: g.publicKey || null
      })),
      threshold,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    this.socialRecovery.set(walletId, config);
    this.stats.socialRecoveryConfigs++;
    
    this.emit('socialRecoveryConfigured', { recoveryId, walletId });
    
    return recoveryId;
  }

  /**
   * Initiate a social recovery request
   * 
   * @param {Object} params - Recovery request parameters
   * @param {string} params.walletId - Wallet ID to recover
   * @param {string} params.requesterAddress - Address of requester
   * @param {string} params.newAgentId - Agent ID for recovered wallet
   * @returns {string} Recovery request ID
   */
  initiateSocialRecovery(params) {
    const { walletId, requesterAddress, newAgentId } = params;
    
    // Get social recovery config
    const config = this.socialRecovery.get(walletId);
    if (!config) {
      throw new Error('Social recovery not configured for this wallet');
    }
    
    if (!config.active) {
      throw new Error('Social recovery is not active');
    }
    
    // Create recovery request
    const requestId = this._generateRequestId();
    const request = {
      requestId,
      walletId,
      requesterAddress,
      newAgentId,
      approvals: new Set(),
      rejections: new Set(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    this.recoveryRequests.set(requestId, request);
    this.stats.recoveryRequests++;
    
    this.emit('socialRecoveryInitiated', { requestId, walletId });
    
    return requestId;
  }

  /**
   * Guardian approves or rejects a recovery request
   * 
   * @param {Object} params - Approval parameters
   * @param {string} params.requestId - Recovery request ID
   * @param {string} params.guardianAddress - Guardian's address
   * @param {boolean} params.approve - True to approve, false to reject
   * @returns {Object} Request status
   */
  guardianVote(params) {
    const { requestId, guardianAddress, approve } = params;
    
    const request = this.recoveryRequests.get(requestId);
    if (!request) {
      throw new Error(`Recovery request ${requestId} not found`);
    }
    
    if (request.status !== 'pending') {
      throw new Error('Recovery request is not pending');
    }
    
    // Verify guardian
    const config = this.socialRecovery.get(request.walletId);
    const guardian = config.guardians.find(g => g.address === guardianAddress);
    if (!guardian) {
      throw new Error('Not an authorized guardian');
    }
    
    // Check if already voted
    if (request.approvals.has(guardianAddress) || request.rejections.has(guardianAddress)) {
      throw new Error('Guardian has already voted');
    }
    
    // Record vote
    if (approve) {
      request.approvals.add(guardianAddress);
    } else {
      request.rejections.add(guardianAddress);
    }
    
    // Check if threshold met
    if (request.approvals.size >= config.threshold) {
      request.status = 'approved';
      this.emit('socialRecoveryApproved', { requestId });
    } else if (request.rejections.size > config.guardians.length - config.threshold) {
      request.status = 'rejected';
      this.emit('socialRecoveryRejected', { requestId });
    }
    
    return {
      requestId,
      status: request.status,
      approvals: request.approvals.size,
      rejections: request.rejections.size,
      threshold: config.threshold
    };
  }

  /**
   * Execute an approved social recovery
   * 
   * @param {string} requestId - Recovery request ID
   * @param {string} backupId - Backup ID to restore from
   * @param {string} password - Backup password
   * @returns {Object} Restored wallet information
   */
  executeSocialRecovery(requestId, backupId, password) {
    const request = this.recoveryRequests.get(requestId);
    if (!request) {
      throw new Error(`Recovery request ${requestId} not found`);
    }
    
    if (request.status !== 'approved') {
      throw new Error('Recovery request is not approved');
    }
    
    // Restore wallet
    const restored = this.restoreFromBackup({
      backupId,
      password,
      agentId: request.newAgentId
    });
    
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    
    this.emit('socialRecoveryCompleted', {
      requestId,
      walletId: restored.walletId
    });
    
    return restored;
  }

  /**
   * Configure emergency access for a wallet
   * 
   * @param {Object} params - Emergency access parameters
   * @param {string} params.walletId - Wallet ID
   * @param {string} params.emergencyContact - Emergency contact address
   * @param {number} [params.delayHours] - Delay before emergency access (hours)
   * @returns {string} Emergency access ID
   */
  configureEmergencyAccess(params) {
    const {
      walletId,
      emergencyContact,
      delayHours = this.config.emergencyDelayHours
    } = params;
    
    const wallet = this.walletManager.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }
    
    const accessId = this._generateAccessId();
    const config = {
      accessId,
      walletId,
      emergencyContact,
      delayHours,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    this.emergencyAccess.set(walletId, config);
    
    this.emit('emergencyAccessConfigured', { accessId, walletId });
    
    return accessId;
  }

  /**
   * Get backup information
   * 
   * @param {string} backupId - Backup ID
   * @returns {Object|null} Backup information (without sensitive data)
   */
  getBackup(backupId) {
    const backup = this.backups.get(backupId);
    if (!backup) return null;
    
    const { encrypted, ...safeBackup } = backup;
    return safeBackup;
  }

  /**
   * Get all backups for a wallet
   * 
   * @param {string} walletId - Wallet ID
   * @returns {Array<Object>} Array of backup information
   */
  getWalletBackups(walletId) {
    const backups = [];
    
    for (const backup of this.backups.values()) {
      if (backup.walletId === walletId) {
        const { encrypted, ...safeBackup } = backup;
        backups.push(safeBackup);
      }
    }
    
    return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get recovery statistics
   * 
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this.stats };
  }

  // Private methods

  _generateBackupId() {
    return `backup-${crypto.randomBytes(16).toString('hex')}`;
  }

  _generateRecoveryId() {
    return `recovery-${crypto.randomBytes(16).toString('hex')}`;
  }

  _generateRequestId() {
    return `request-${crypto.randomBytes(16).toString('hex')}`;
  }

  _generateAccessId() {
    return `access-${crypto.randomBytes(16).toString('hex')}`;
  }

  _encryptBackup(data, password) {
    // Generate unique salt for each backup
    const salt = crypto.randomBytes(32);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const dataStr = JSON.stringify(data);
    let encrypted = cipher.update(dataStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  _decryptBackup(encrypted, password) {
    const salt = Buffer.from(encrypted.salt, 'hex');
    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encrypted.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}

export default BackupRecoveryManager;
