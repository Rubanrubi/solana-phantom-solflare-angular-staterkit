import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncatePublicKey',
  standalone: true
})
export class TruncatePublicKeyPipe implements PipeTransform {

  transform(value: any): string {
    if (typeof value.toBase58 !== 'function') {
      return value.substring(0, 6);
    }

    const base58Value = value.toBase58();
    return base58Value.substring(0, 6); // Get the first 6 characters
  }

}
