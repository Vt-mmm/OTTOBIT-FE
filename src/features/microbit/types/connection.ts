/**
 * @license
 * Copyright 2024 Ottobot
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ConnectionType {
  USB = "usb",
  BLUETOOTH = "bluetooth",
}

export interface MicrobitDevice {
  id: string;
  name: string;
  connected: boolean;
  connectionType: ConnectionType;
  serialNumber?: string;
  bluetoothId?: string;
  characteristics?: BluetoothRemoteGATTCharacteristic[];
}

export interface ConnectionOptions {
  autoConnect?: boolean;
  timeout?: number;
  preferredType?: ConnectionType;
}

export interface ConnectionService {
  connect(options?: ConnectionOptions): Promise<MicrobitDevice>;
  disconnect(): Promise<void>;
  sendData(data: string): Promise<void>;
  readData(timeout?: number): Promise<string>;
  uploadCode(code: string): Promise<void>;
  getDevice(): MicrobitDevice | null;
  isConnected(): boolean;
  getConnectionType(): ConnectionType;
}

export interface ConnectionCapabilities {
  supportsUSB: boolean;
  supportsBluetooth: boolean;
  canUploadCode: boolean;
  canReadData: boolean;
  canSendData: boolean;
}
