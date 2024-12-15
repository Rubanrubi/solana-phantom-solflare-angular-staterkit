import { Injectable } from '@angular/core';
import { WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletErrorType } from '../models/wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletErrorHandler {
  handleError(error: Error | WalletError): { type: WalletErrorType; message: string } {
    // Determine error type
    const errorType = this.getErrorType(error);
    
    // Get appropriate error message
    const message = this.getErrorMessage(errorType, error);

    // Log error for debugging
    console.error(`Wallet Error (${errorType}):`, error);

    return { type: errorType, message };
  }

  private getErrorType(error: Error | WalletError): WalletErrorType {
    if (error instanceof WalletNotConnectedError) {
      return WalletErrorType.NOT_CONNECTED;
    }

    switch (error.name) {
      case 'WalletNotReadyError':
        return WalletErrorType.NOT_FOUND;
      case 'WalletConnectionError':
        return WalletErrorType.USER_REJECTED;
      case 'WalletNetworkError':
        return WalletErrorType.NETWORK_ERROR;
      case 'WalletUserRejectedError':
        return WalletErrorType.USER_REJECTED;
      case 'WalletDisconnectedError':
        return WalletErrorType.WALLET_DISCONNECTED_ERROR;
      default:
        return WalletErrorType.UNKNOWN;
    }
  }

  private getErrorMessage(type: WalletErrorType, error: Error): string {
    switch (type) {
      case WalletErrorType.NOT_FOUND:
        return 'Wallet extension not found. Please install the wallet.';
      case WalletErrorType.NOT_CONNECTED:
        return 'Wallet is not connected. Please connect your wallet.';
      case WalletErrorType.CONNECTION_FAILED:
        return 'Failed to connect to the wallet. Please try again.';
      case WalletErrorType.NETWORK_ERROR:
        return 'Network error occurred. Please check your internet connection.';
      case WalletErrorType.USER_REJECTED:
        return 'Transaction was rejected by the user.';
      case WalletErrorType.WALLET_DISCONNECTED_ERROR:
        return 'Wallet disconnected.';
      default:
        return error.message || 'An unknown error occurred.';
    }
  }
}