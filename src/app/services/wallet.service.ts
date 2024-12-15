import { Injectable } from '@angular/core';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Adapter, WalletAdapterNetwork, WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletInfo } from '../models/wallet.types';
import { WalletErrorHandler } from '../utils/wallet-error.handler';
import { WalletStateService } from './wallet-state.service';
import { SUPPORTED_WALLETS, WALLET_INSTALL_URLS, DEFAULT_NETWORK } from '../config/wallet.config';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private currentAdapter: Adapter | null = null;
  private connection: Connection;
  readonly wallets = SUPPORTED_WALLETS;

  constructor(
    private errorHandler: WalletErrorHandler,
    private stateService: WalletStateService
  ) {
    this.connection = new Connection(clusterApiUrl(DEFAULT_NETWORK));
    this.initializeWalletState();
  }

  private initializeWalletState() {
    const savedState: any = this.stateService.loadState();
    console.log('load state',savedState);
    if (savedState?.connected && savedState.walletName) {
      const wallet = this.wallets.find(w => w.name === savedState.walletName);
      if (wallet) {
        this.setAdapter(wallet.adapter);
        this.stateService.updateNetwork(savedState.network);
        this.stateService.updateConnectionState(true, savedState.account);
        // this.connect();
      }
    }
  }

  private setupWalletListeners(adapter: Adapter) {
    console.log('network', adapter);
    adapter.on('connect', (publicKey: PublicKey) => {
        console.log('service on connect', publicKey);
        this.stateService.updateConnectionState(true, publicKey);
        this.stateService.saveState({ connected: true, walletName: this.getCurrentWalletName(), account: publicKey.toString(), network: 'testnet' });
        this.stateService.toggleModal(false);
    });

    adapter.on('disconnect', () => {
      console.log('service on disconnect');
      this.stateService.updateConnectionState(false, null);
      this.stateService.saveState({ connected: false, walletName: null, account: null, network: null });
    });

    adapter.on('error', (error: WalletError) => {
      const { type, message } = this.errorHandler.handleError(error);
      console.log('service on error', error);
      if (type === 'WalletNotReadyError') {
        this.handleWalletNotFound(this.currentAdapter);
      }
    });
  }

  private getCurrentWalletName(): string | null {
    if (!this.currentAdapter) return null;
    const wallet = this.wallets.find(w => w.adapter === this.currentAdapter);
    return wallet?.name || null;
  }

  private handleWalletNotFound(adapter: Adapter | null) {
    if (!adapter) return;
    
    const wallet = this.wallets.find(w => w.adapter === adapter);
    if (!wallet) return;

    const installUrl = WALLET_INSTALL_URLS[wallet.name];
    if (installUrl) {
      const userChoice = window.confirm(
        `${wallet.name} wallet is not installed. Would you like to install it now?`
      );
      if (userChoice) {
        window.open(installUrl, '_blank');
      }
    }
  }

  private async checkWalletAvailability(adapter: Adapter): Promise<any> {
    try {
      if ('ready' in adapter) {
        return adapter.ready;
      }
      await adapter.connect();
      await adapter.disconnect();
      return true;
    } catch (error) {
      const { type } = this.errorHandler.handleError(error as Error);
      if (type === 'WalletNotReadyError') {
        this.handleWalletNotFound(adapter);
      }
      return false;
    }
  }

  setAdapter(adapter: Adapter) {
    this.currentAdapter = adapter;
    this.setupWalletListeners(adapter);
  }

  async connect() {
    if (!this.currentAdapter) {
      this.stateService.toggleModal(true);
      return;
    }

    try {
      // const isAvailable = await this.checkWalletAvailability(this.currentAdapter);
      // if (!isAvailable) return;
      
      await this.currentAdapter.connect();
    } catch (error) {
      const { type } = this.errorHandler.handleError(error as Error);
      if (type === 'WalletNotReadyError') {
        this.handleWalletNotFound(this.currentAdapter);
      }
      throw error;
    }
  }

  async connectWithWallet(wallet: WalletInfo) {
    this.setAdapter(wallet.adapter);
    await this.connect();
  }

  async disconnect() {
    if (!this.currentAdapter) return;
    try {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
    } catch (error) {
      this.errorHandler.handleError(error as Error);
      throw error;
    }
  }

  async changeNetwork(newNetwork: WalletAdapterNetwork) {
    this.connection = new Connection(clusterApiUrl(newNetwork));
    this.stateService.updateNetwork(newNetwork);
  }

  async getBalance(): Promise<number> {
    const publicKey = this.stateService.currentPublicKey;
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }
    return this.connection.getBalance(publicKey);
  }
}