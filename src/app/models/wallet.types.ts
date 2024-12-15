import { Adapter } from '@solana/wallet-adapter-base';

export interface WalletInfo {
  name: string;
  icon: string;
  adapter: Adapter;
}

export interface WalletState {
  connected: boolean;
  walletName: string | null;
  account: string | null;
  network: string | null;
}

export enum WalletErrorType {
  NOT_FOUND = 'WalletNotReadyError',
  NOT_CONNECTED = 'WalletNotConnectedError',
  CONNECTION_FAILED = 'ConnectionError',
  NETWORK_ERROR = 'NetworkError',
  USER_REJECTED = 'WalletConnectionError',
  UNKNOWN = 'UnknownError',
  WALLET_DISCONNECTED_ERROR = 'WalletDisconnectedError'
}