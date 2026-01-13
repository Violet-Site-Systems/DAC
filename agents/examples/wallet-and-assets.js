/**
 * Example: Wallet and Asset Management
 * 
 * Demonstrates self-custody features:
 * - HD wallet creation
 * - Asset registration and tracking
 * - Balance monitoring
 * - Key rotation
 */

import { WalletManager, AssetManager, AssetType } from '../custody/index.js';

async function main() {
  console.log('=== Wallet and Asset Management Example ===\n');

  // 1. Create wallet manager
  console.log('1. Creating wallet manager...');
  const walletManager = new WalletManager({
    derivationPath: "m/44'/60'/0'/0"
  });
  console.log('✓ Wallet manager created\n');

  // 2. Create HD wallet for an agent
  console.log('2. Creating HD wallet...');
  const hdWallet = walletManager.createHDWallet({
    agentId: 'agent-001',
    accountIndex: 0
  });
  console.log('HD Wallet Created:');
  console.log(`  - Wallet ID: ${hdWallet.walletId}`);
  console.log(`  - Address: ${hdWallet.address}`);
  console.log(`  - Derivation Path: ${hdWallet.derivationPath}`);
  console.log(`  - Mnemonic: ${hdWallet.mnemonic.substring(0, 20)}...`);
  console.log();

  // 3. Create simple wallet
  console.log('3. Creating simple wallet...');
  const simpleWallet = walletManager.createSimpleWallet({
    agentId: 'agent-001'
  });
  console.log('Simple Wallet Created:');
  console.log(`  - Wallet ID: ${simpleWallet.walletId}`);
  console.log(`  - Address: ${simpleWallet.address}`);
  console.log();

  // 4. Create multi-sig wallet
  console.log('4. Creating multi-sig wallet...');
  const multisigWallet = walletManager.createMultiSigWallet({
    agentId: 'agent-001',
    signers: [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012'
    ],
    threshold: 2
  });
  console.log('Multi-sig Wallet Created:');
  console.log(`  - Wallet ID: ${multisigWallet.walletId}`);
  console.log(`  - Signers: ${multisigWallet.signers.length}`);
  console.log(`  - Threshold: ${multisigWallet.threshold}`);
  console.log();

  // 5. Get all wallets for agent
  console.log('5. Listing all wallets for agent...');
  const agentWallets = walletManager.getAgentWallets('agent-001');
  console.log(`Agent has ${agentWallets.length} wallets:`);
  agentWallets.forEach(wallet => {
    console.log(`  - ${wallet.type}: ${wallet.walletId.substring(0, 20)}...`);
  });
  console.log();

  // 6. Create asset manager
  console.log('6. Creating asset manager...');
  const assetManager = new AssetManager({
    walletManager
  });
  console.log('✓ Asset manager created\n');

  // 7. Register assets
  console.log('7. Registering assets...');
  
  const ethAsset = assetManager.registerAsset({
    symbol: 'ETH',
    name: 'Ethereum',
    type: AssetType.NATIVE,
    decimals: 18
  });
  
  const asiAsset = assetManager.registerAsset({
    symbol: 'ASI',
    name: 'Artificial Superintelligence Token',
    type: AssetType.ERC20,
    contractAddress: '0x1234567890123456789012345678901234567890',
    decimals: 18
  });
  
  const stakedASIAsset = assetManager.registerAsset({
    symbol: 'sASI',
    name: 'Staked ASI',
    type: AssetType.ERC20,
    contractAddress: '0x2345678901234567890123456789012345678901',
    decimals: 18
  });
  
  console.log(`✓ Registered ${assetManager.getStats().totalAssets} assets\n`);

  // 8. Set mock balances
  console.log('8. Setting mock balances...');
  assetManager.updateBalance(hdWallet.walletId, ethAsset, '5.25');
  assetManager.updateBalance(hdWallet.walletId, asiAsset, '1000.5');
  assetManager.updateBalance(hdWallet.walletId, stakedASIAsset, '500.0');
  console.log('✓ Balances updated\n');

  // 9. Get balances
  console.log('9. Checking balances...');
  const balances = assetManager.getAllBalances(hdWallet.walletId);
  console.log('Wallet Balances:');
  for (const [assetId, info] of Object.entries(balances)) {
    console.log(`  - ${info.asset.symbol}: ${info.balance}`);
  }
  console.log();

  // 10. Record a transaction
  console.log('10. Recording a transaction...');
  const txId = assetManager.recordTransaction({
    walletId: hdWallet.walletId,
    assetId: asiAsset,
    type: 'send',
    amount: '100.0',
    to: '0x9876543210987654321098765432109876543210',
    from: hdWallet.address
  });
  console.log(`✓ Transaction recorded: ${txId}\n`);

  // 11. Update transaction status
  console.log('11. Updating transaction status...');
  assetManager.updateTransactionStatus(txId, 'confirmed', '0xabcdef...');
  const transaction = assetManager.getTransaction(txId);
  console.log('Transaction Details:');
  console.log(`  - Status: ${transaction.status}`);
  console.log(`  - Amount: ${transaction.amount} ASI`);
  console.log(`  - To: ${transaction.to}`);
  console.log();

  // 12. Get transaction history
  console.log('12. Getting transaction history...');
  const transactions = assetManager.getWalletTransactions(hdWallet.walletId);
  console.log(`Found ${transactions.length} transactions`);
  console.log();

  // 13. Rotate wallet keys
  console.log('13. Rotating wallet keys...');
  const rotated = await walletManager.rotateKeys(hdWallet.walletId);
  console.log('Keys Rotated:');
  console.log(`  - Old Address: ${hdWallet.address}`);
  console.log(`  - New Address: ${rotated.address}`);
  console.log(`  - Rotation Count: ${rotated.rotationCount}`);
  console.log();

  // 14. Statistics
  console.log('14. Manager statistics...');
  const walletStats = walletManager.getStats();
  const assetStats = assetManager.getStats();
  console.log('Wallet Manager:');
  console.log(`  - Total Wallets: ${walletStats.totalWallets}`);
  console.log(`  - HD Wallets: ${walletStats.hdWallets}`);
  console.log(`  - Simple Wallets: ${walletStats.simpleWallets}`);
  console.log(`  - Multi-sig Wallets: ${walletStats.multisigWallets}`);
  console.log('Asset Manager:');
  console.log(`  - Total Assets: ${assetStats.totalAssets}`);
  console.log(`  - Total Transactions: ${assetStats.totalTransactions}`);
  console.log();

  console.log('=== Example completed successfully ===');
}

// Run the example
main().catch(error => {
  console.error('Example failed:', error);
  process.exit(1);
});
