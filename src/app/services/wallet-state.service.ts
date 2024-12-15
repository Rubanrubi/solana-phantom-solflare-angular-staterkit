import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletState } from '../models/wallet.types';
import { DEFAULT_NETWORK, WALLET_STORAGE_KEY } from '../config/wallet.config';

@Injectable({
  providedIn: 'root'
})
export class WalletStateService {
  private walletConnected = new BehaviorSubject<boolean>(false);
  private publicKey = new BehaviorSubject<PublicKey | null>(null);
  private network = new BehaviorSubject<WalletAdapterNetwork>(DEFAULT_NETWORK);
  private showModal = new BehaviorSubject<boolean>(false);

  walletConnected$ = this.walletConnected.asObservable();
  publicKey$ = this.publicKey.asObservable();
  network$ = this.network.asObservable();
  showModal$ = this.showModal.asObservable();

    // Add getter for current public key value
  get currentPublicKey(): PublicKey | null {
        return this.publicKey.getValue();
   }

  updateConnectionState(connected: boolean, publicKey: PublicKey | null) {
    this.walletConnected.next(connected);
    this.publicKey.next(publicKey);
  }

  updateNetwork(network: WalletAdapterNetwork) {
    this.network.next(network);
  }

  toggleModal(show?: boolean) {
    this.showModal.next(show ?? !this.showModal.getValue());
  }

  saveState(state: WalletState) {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
  }

  loadState(): WalletState | null {
    const savedState = localStorage.getItem(WALLET_STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  }
}