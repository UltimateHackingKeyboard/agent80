import { LogOptions } from '../models/log-options.js';
import { UserConfiguration } from '../config-serializer/config-items/user-configuration.js';
import { logUserConfigHelper } from './log-user-config-helper.js';
import { DEFAULT_LOG_OPTIONS } from './default-log-options.js';

export class LogService {

    protected _options = DEFAULT_LOG_OPTIONS;
    protected _usbReportId: number = 0;

    setLogOptions(options: LogOptions): void {
        this._options = options;
    }

    setUsbReportId(reportId: number): void {
        this._usbReportId = reportId;
    }

    config(message: string, config: UserConfiguration | string): void {
        if (!this._options.config) {
            return;
        }

        logUserConfigHelper(this.log, message, config);
    }

    error(...args: any[]): void {
        console.error(...args);
    }

    misc(...args: any[]): void {
        if (!this._options.misc) {
            return;
        }

        this.log(...args);
    }

    usb(...args: any[]): void {
        if (!this._options.usb) {
            return;
        }

        this.log(...args);
    }

    protected log(...args: any[]): void {
        console.log(...args);
    }
}
