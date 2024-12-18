import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';

interface ApiResponse {
  status: boolean;
  data?: any;
  success?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeysService {
  private readonly hostServer = environment.hostServer;
  private readonly host = this.hostServer + '/rest/web3';

  constructor(private readonly http: HttpClient) {}

  nftUnlocked(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.host + '/nftUnlocked').pipe(
      map((response) => this.ensureBooleanStatus(response)),
      catchError((err) => throwError(() => err))
    );
  }

  nftMintListen(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.host + '/nftMintListen').pipe(
      map((response) => this.ensureBooleanStatus(response)),
      catchError((err) => throwError(() => err))
    );
  }

  checkNftMinted(): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.hostServer + '/api/Challenges/?key=nftMintChallenge')
      .pipe(
        map((response) => this.ensureBooleanStatus(response)),
        catchError((err) => throwError(() => err))
      );
  }

  submitKey(privateKey: string): Observable<ApiResponse> {
    const endpoint = this.host + '/submitKey';
    const params = { privateKey };
    return this.http.post<ApiResponse>(endpoint, params).pipe(
      map((response) => this.ensureBooleanStatus(response)),
      catchError((err) => throwError(() => err))
    );
  }

  verifyNFTWallet(walletAddress: string): Observable<ApiResponse> {
    const endpoint = this.host + '/walletNFTVerify';
    const params = { walletAddress };
    return this.http.post<ApiResponse>(endpoint, params).pipe(
      map((response) => this.ensureBooleanStatus(response)),
      catchError((err) => throwError(() => err))
    );
  }

  walletAddressSend(walletAddress: string): Observable<ApiResponse> {
    const endpoint = this.host + '/walletExploitAddress';
    const params = { walletAddress };
    return this.http.post<ApiResponse>(endpoint, params).pipe(
      map((response) => this.ensureBooleanStatus(response)),
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Ensure `status` is strictly boolean.
   */
  private ensureBooleanStatus(response: ApiResponse): ApiResponse {
    response.status = !!response.status; // Μετατρέπει οποιοδήποτε τιμή σε boolean (true/false)
    return response;
  }
}
