/**
 * DAC Agent Framework - Custody Module
 * 
 * Self-custody mechanisms for DAC agents.
 * Provides secure wallet management and asset tracking.
 */

import { WalletManager, WalletType } from './WalletManager.js';
import { AssetManager, AssetType, TransactionStatus } from './AssetManager.js';
import { BackupRecoveryManager, RecoveryMethod, BackupStatus } from './BackupRecoveryManager.js';

export { WalletManager, WalletType };
export { AssetManager, AssetType, TransactionStatus };
export { BackupRecoveryManager, RecoveryMethod, BackupStatus };

export default {
  WalletManager,
  WalletType,
  AssetManager,
  AssetType,
  TransactionStatus,
  BackupRecoveryManager,
  RecoveryMethod,
  BackupStatus
};
