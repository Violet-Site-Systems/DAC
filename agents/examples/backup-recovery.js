/**
 * Example: Backup and Recovery
 * 
 * Demonstrates backup and recovery features:
 * - Creating encrypted backups
 * - Verifying backups
 * - Restoring from backup
 * - Social recovery configuration
 * - Emergency access setup
 */

import { WalletManager } from '../custody/WalletManager.js';
import { BackupRecoveryManager } from '../custody/BackupRecoveryManager.js';

async function main() {
  console.log('=== Backup and Recovery Example ===\n');

  // 1. Create wallet manager
  console.log('1. Creating wallet manager...');
  const walletManager = new WalletManager();
  console.log('✓ Wallet manager created\n');

  // 2. Create a wallet
  console.log('2. Creating HD wallet...');
  const wallet = walletManager.createHDWallet({
    agentId: 'agent-001',
    accountIndex: 0
  });
  console.log(`✓ Wallet created: ${wallet.address}\n`);

  // 3. Create backup manager
  console.log('3. Creating backup manager...');
  const backupManager = new BackupRecoveryManager({
    walletManager
  });
  console.log('✓ Backup manager created\n');

  // 4. Create encrypted backup
  console.log('4. Creating encrypted backup...');
  const backup = backupManager.createBackup({
    walletId: wallet.walletId,
    password: 'SecureBackupPassword123!',
    metadata: {
      description: 'Initial wallet backup',
      location: 'Secure offline storage'
    }
  });
  console.log('Backup Created:');
  console.log(`  - Backup ID: ${backup.backupId}`);
  console.log(`  - Encrypted: ${backup.encryptedBackup.substring(0, 32)}...`);
  console.log();

  // 5. Verify backup
  console.log('5. Verifying backup...');
  const verified = backupManager.verifyBackup(
    backup.backupId,
    'SecureBackupPassword123!'
  );
  console.log(`✓ Backup verified: ${verified}\n`);

  // 6. Configure social recovery
  console.log('6. Configuring social recovery...');
  const recoveryId = backupManager.configureSocialRecovery({
    walletId: wallet.walletId,
    guardians: [
      {
        address: '0x1111111111111111111111111111111111111111',
        name: 'Guardian Alice',
        contact: 'alice@example.com'
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        name: 'Guardian Bob',
        contact: 'bob@example.com'
      },
      {
        address: '0x3333333333333333333333333333333333333333',
        name: 'Guardian Charlie',
        contact: 'charlie@example.com'
      }
    ],
    threshold: 2
  });
  console.log(`✓ Social recovery configured: ${recoveryId}`);
  console.log('  - Guardians: 3');
  console.log('  - Threshold: 2\n');

  // 7. Configure emergency access
  console.log('7. Configuring emergency access...');
  const accessId = backupManager.configureEmergencyAccess({
    walletId: wallet.walletId,
    emergencyContact: '0x4444444444444444444444444444444444444444',
    delayHours: 48
  });
  console.log(`✓ Emergency access configured: ${accessId}`);
  console.log('  - Delay: 48 hours\n');

  // 8. Simulate wallet loss and recovery
  console.log('8. Simulating wallet loss and recovery...');
  console.log('   (In real scenario, original wallet would be lost)\n');

  // 9. Initiate social recovery
  console.log('9. Initiating social recovery request...');
  const requestId = backupManager.initiateSocialRecovery({
    walletId: wallet.walletId,
    requesterAddress: '0x5555555555555555555555555555555555555555',
    newAgentId: 'agent-002-recovered'
  });
  console.log(`✓ Recovery request initiated: ${requestId}\n`);

  // 10. Guardian votes
  console.log('10. Guardians voting on recovery request...');
  
  // Guardian 1 approves
  let vote1 = backupManager.guardianVote({
    requestId: requestId,
    guardianAddress: '0x1111111111111111111111111111111111111111',
    approve: true
  });
  console.log(`  - Guardian Alice approved (${vote1.approvals}/${vote1.threshold})`);
  
  // Guardian 2 approves (reaches threshold)
  let vote2 = backupManager.guardianVote({
    requestId: requestId,
    guardianAddress: '0x2222222222222222222222222222222222222222',
    approve: true
  });
  console.log(`  - Guardian Bob approved (${vote2.approvals}/${vote2.threshold})`);
  console.log(`✓ Recovery request ${vote2.status}\n`);

  // 11. Execute recovery
  console.log('11. Executing social recovery...');
  const restored = backupManager.executeSocialRecovery(
    requestId,
    backup.backupId,
    'SecureBackupPassword123!'
  );
  console.log('✓ Wallet restored successfully');
  console.log(`  - New Wallet ID: ${restored.walletId}`);
  console.log(`  - Address: ${restored.address}`);
  console.log();

  // 12. Verify restored wallet
  console.log('12. Verifying restored wallet...');
  const restoredWallet = walletManager.getWallet(restored.walletId);
  console.log('Restored Wallet:');
  console.log(`  - Agent ID: ${restoredWallet.agentId}`);
  console.log(`  - Type: ${restoredWallet.type}`);
  console.log(`  - Address: ${restoredWallet.address}`);
  console.log();

  // 13. Get backup history
  console.log('13. Backup history...');
  const backups = backupManager.getWalletBackups(wallet.walletId);
  console.log(`Found ${backups.length} backup(s):`);
  backups.forEach(b => {
    console.log(`  - ${b.backupId.substring(0, 20)}... (${b.status})`);
  });
  console.log();

  // 14. Statistics
  console.log('14. Backup manager statistics...');
  const stats = backupManager.getStats();
  console.log('Stats:');
  console.log(`  - Total Backups: ${stats.totalBackups}`);
  console.log(`  - Verified Backups: ${stats.verifiedBackups}`);
  console.log(`  - Social Recovery Configs: ${stats.socialRecoveryConfigs}`);
  console.log(`  - Recovery Requests: ${stats.recoveryRequests}`);
  console.log();

  console.log('=== Example completed successfully ===');
  console.log('\n⚠️  Important Security Reminders:');
  console.log('   - Always store backups in secure, offline locations');
  console.log('   - Use strong, unique passwords for backup encryption');
  console.log('   - Choose trustworthy guardians for social recovery');
  console.log('   - Test recovery procedures regularly');
  console.log('   - Keep backup information confidential');
}

// Run the example
main().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
