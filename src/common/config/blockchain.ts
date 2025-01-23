import { Client } from 'xrpl';

export const xrplClient = new Client(process.env.XRPL_NODE || 'wss://s.altnet.rippletest.net:51233');

export const blockchainConfig = {
  coldWallet: process.env.XRPL_COLD_WALLET,
  hotWallet: process.env.XRPL_HOT_WALLET,
  hotWalletSeed: process.env.XRPL_HOT_WALLET_SEED,
  
  tokens: {
    SHK: {
      currency: 'SHK',
      issuer: process.env.XRPL_COLD_WALLET,
    },
    MVP: {
      currency: 'MVP',
      issuer: process.env.XRPL_COLD_WALLET,
    },
  },
  
  hooks: {
    escrow: process.env.XRPL_ESCROW_HOOK,
    kosher: process.env.XRPL_KOSHER_HOOK,
  },
};

export const connectXRPL = async () => {
  try {
    await xrplClient.connect();
    console.log('Connected to XRPL successfully');
  } catch (error) {
    console.error('XRPL connection error:', error);
    process.exit(1);
  }
};

export default {
  xrplClient,
  blockchainConfig,
  connectXRPL,
};
