/**
 * @license
 * Copyright 2024 ottobit
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simple connection manager for micro:bit HEX upload
 */
export class MicrobitConnectionManager {
  private isConnectedState: boolean = false;

  /**
   * Connect to micro:bit (placeholder for UI state)
   */
  async connect(): Promise<boolean> {
    this.isConnectedState = true;
    return true;
  }

  /**
   * Disconnect from micro:bit
   */
  async disconnect(): Promise<void> {
    this.isConnectedState = false;
  }

  /**
   * Check if connected
   */
  async isConnected(): Promise<boolean> {
    return this.isConnectedState;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnectedState;
  }
}
