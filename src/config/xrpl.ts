import { Client } from 'xrpl';

let xrplClient: Client;

export const initXrplClient = async (): Promise<void> => {
  try {
    // Initialize XRPL client (testnet for development)
    xrplClient = new Client('wss://s.altnet.rippletest.net:51233');
    await xrplClient.connect();
    console.log('Connected to XRPL');
  } catch (error) {
    console.error('Failed to connect to XRPL:', error);
    throw error;
  }
};

export const getXrplClient = (): Client => {
  if (!xrplClient) {
    throw new Error('XRPL client not initialized');
  }
  return xrplClient;
};
