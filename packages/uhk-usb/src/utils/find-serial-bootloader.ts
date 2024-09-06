import {SerialPort} from 'serialport';
import { VidPidPair } from 'uhk-common';

import { ReenumerateResult } from '../models/reenumerate-result.js';

export async function findSerialBootloader(vidPids: VidPidPair[] ): Promise<ReenumerateResult | undefined> {
    const serialDevices = await SerialPort.list();

    for (const vidPid of vidPids) {
        for (const serialDevice of serialDevices) {
            if (serialDevice.vendorId === vidPid.vid.toString(16) && serialDevice.productId === vidPid.pid.toString(16)) {
                return {
                    vidPidPair: vidPid,
                    serialPath: serialDevice.path,
                    usbPath: '',
                };
            }
        }
    }
}
