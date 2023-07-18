import { AppSupervisor } from '../app-supervisor';
import Application from '../application';

export interface RpcBrokerOptions {
  discoveryServerURI?: string;
}

export interface AcquireLockOptions {
  lockName: string;
  timeout?: number;
  retryDelay?: number;
  maxRetries?: number;
}

export abstract class RpcBrokerInterface {
  appSupervisor: AppSupervisor;
  options: RpcBrokerOptions;

  constructor(appSupervisor: AppSupervisor, options: RpcBrokerOptions = {}) {
    this.appSupervisor = appSupervisor;
    this.options = options;
  }

  async destroy() {}

  abstract callApp(appName: string, method: string, ...args: any[]): Promise<{ result: any }>;

  abstract pushToApp(appName: string, event: string, options?: any): Promise<boolean>;

  abstract broadcast(caller: Application, event: string, eventOptions?: any);

  abstract acquireLock(options: AcquireLockOptions): Promise<string | null>;

  abstract releaseLock(lockName: string, identifier: string): Promise<boolean>;
}
