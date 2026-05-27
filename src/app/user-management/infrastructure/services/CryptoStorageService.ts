import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoStorageService {

  setItem(key: string, value: string) {
    const encryptedValue = CryptoJS.AES.encrypt(value, key).toString();
    localStorage.setItem(key, encryptedValue);
  }

  getItem(key: string) {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  }

}
