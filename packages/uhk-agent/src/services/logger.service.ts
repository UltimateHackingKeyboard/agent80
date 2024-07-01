import * as path from 'path';
import * as log from 'electron-log';
import { logUserConfigHelper, LogService, LogRegExps, UserConfiguration } from 'uhk-common';

log.transports.console.level = 'silly';
log.transports.file.level = 'silly';
log.transports.ipc.level = 'silly';
log.transports.file.resolvePath = variables => {
    return path.join(variables.libraryDefaultDir, 'uhk-agent.log');
};

export class ElectronLogService extends LogService {

    config(message: string, config: UserConfiguration | string): void {
        if (!this._options.config) {
            return;
        }

        logUserConfigHelper(this.log, message, config);
    }

    error(...args: any[]): void {
        log.error(...args);
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

        if (LogRegExps.writeRegExp.test(args[0])) {
            this.log('%c' + args.join(' '), 'color:blue');
        } else if (LogRegExps.readRegExp.test(args[0])) {
            let errorCodeStartIndex = 0;
            let errorCodeEndIndex = 2;

            if (this._usbReportId) {
                errorCodeStartIndex = 3;
                errorCodeEndIndex = 5;
            }

            if (args[1] && args[1].substring(errorCodeStartIndex, errorCodeEndIndex) === '00') {
                this.log('%c' + args.join(' '), 'color:green');
            } else {
                this.log('%c' + args.join(' '), 'color:red');
            }
        } else if (LogRegExps.transferRegExp.test(args[0])) {
            this.log('%c' + args.join(' '), 'color:orange');
        } else {
            this.log(...args);
        }
    }

    protected log(...args: any[]): void {
        log.log(...args);
    }
}
