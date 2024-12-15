import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { WalletStateService } from '../../services/wallet-state.service';
import { WalletInfo } from '../../models/wallet.types';

@Component({
  selector: 'app-connect-wallet-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect-wallet-modal.component.html',
  styleUrl: './connect-wallet-modal.component.css'
})
export class ConnectWalletModalComponent {
  private readonly walletService = inject(WalletService);
  private readonly stateService = inject(WalletStateService);

  readonly wallets = this.walletService.wallets;
  readonly showModal$ = this.stateService.showModal$;

  closeModal() {
    this.stateService.toggleModal(false);
  }

  async connectWallet(wallet: WalletInfo) {
    try {
      await this.walletService.connectWithWallet(wallet);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

}
