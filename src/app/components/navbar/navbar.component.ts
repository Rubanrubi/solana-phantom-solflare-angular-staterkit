import { Component, inject } from '@angular/core';
import { ConnectWalletModalComponent } from "../connect-wallet-modal/connect-wallet-modal.component";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Subject, takeUntil } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { WalletStateService } from '../../services/wallet-state.service';
import { WalletErrorHandler } from '../../utils/wallet-error.handler';
import { TruncatePublicKeyPipe } from "../../pipes/truncate-public-key.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ConnectWalletModalComponent, TruncatePublicKeyPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private readonly walletService = inject(WalletService);
  private readonly stateService = inject(WalletStateService);
  private readonly errorHandler = inject(WalletErrorHandler);
  private readonly destroy$ = new Subject<void>();

  readonly LAMPORTS_PER_SOL = 1000000000; // 1 SOL = 1 billion lamports
  readonly networks = WalletAdapterNetwork;
  isDropdownOpen = false;

  walletConnected$ = this.stateService.walletConnected$;
  publicKey$ = this.stateService.publicKey$;
  network$ = this.stateService.network$;
  balance: number | null = null;

  ngOnInit() {
    // Subscribe to wallet connection changes to update balance
    this.walletConnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        if (connected) {
          console.log('connected status', connected);
          this.updateBalance();
        } else {
          this.balance = null;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  connect() {
    this.stateService.toggleModal(true);
  }

  async disconnect() {
    try {
      await this.walletService.disconnect();
      this.balance = null;
    } catch (error) {
      const { message } = this.errorHandler.handleError(error as Error);
      console.error('Failed to disconnect:', message);
    }
  }

  async changeNetwork(network: WalletAdapterNetwork) {    
    try {
      await this.walletService.changeNetwork(network);
      await this.updateBalance();
      this.isDropdownOpen = false; // Close the dropdown
    } catch (error) {
      const { message } = this.errorHandler.handleError(error as Error);
      console.error('Failed to change network:', message);
    }
  }

  togglNetworkDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  private async updateBalance() {
    try {
      this.balance = await this.walletService.getBalance();
      console.log('balance', this.balance);
    } catch (error) {
      const { message } = this.errorHandler.handleError(error as Error);
      console.error('Failed to fetch balance:', message);
      this.balance = null;
    }
  }

}
