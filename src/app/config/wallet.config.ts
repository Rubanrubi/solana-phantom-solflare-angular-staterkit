import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletInfo } from '../models/wallet.types';

export const WALLET_STORAGE_KEY = 'solana_wallet_state';

export const WALLET_INSTALL_URLS: Record<string, string> = {
  Phantom: 'https://phantom.app/download',
  Solflare: 'https://solflare.com/download'
};

export const DEFAULT_NETWORK = WalletAdapterNetwork.Devnet;

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    name: 'Phantom',
    icon: 'assets/phantom.svg',
    adapter: new PhantomWalletAdapter()
  },
  {
    name: 'Solflare',
    icon: 'assets/solflare.svg',
    adapter: new SolflareWalletAdapter()
  }
];