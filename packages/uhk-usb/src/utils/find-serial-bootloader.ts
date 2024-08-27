import os from 'node:os';
import {SerialPort} from 'serialport';
import { UHK_DEVICE_IDS_TYPE } from 'uhk-common';
import {WebUSB} from 'usb';

import { ReenumerateResult } from '../models/reenumerate-result.js';

export async function findSerialBootloader(vendorId: number, productId: number, bcdDevice: UHK_DEVICE_IDS_TYPE ): Promise<ReenumerateResult | undefined> {
    const serialDevices = await SerialPort.list();

    const customWebUSB = new WebUSB({
        allowAllDevices: true
    });

    const usbVersionMinor = convertBcdDeviceToUsbVersionMinor(bcdDevice);

    const usbDevices = await customWebUSB.getDevices();
    const usbDevice = usbDevices.find(device => {
        return device.vendorId === vendorId &&
            device.productId === productId &&
            device.usbVersionMajor === 2 && // bootloader version number is 1
            device.usbVersionMinor === 0 && // usbVersionMinor.minor &&
            device.usbVersionSubminor === 0; // usbVersionMinor.subMinor;
    });

    if (!usbDevice) {
        return undefined;
    }

    for (const serialDevice of serialDevices) {
        if(usbDevice.vendorId.toString(16) === serialDevice.vendorId
            && usbDevice.productId.toString(16) === serialDevice.productId) {
            const platform = os.platform();

            if(platform === 'win32') {
                if (serialDevice.pnpId?.includes(usbDevice.serialNumber)) {
                    return {
                        usbPath: '',
                        serialPath: serialDevice.path
                    };
                }
            }
            // On Linux, Mac and other Unix-like systems
            else if(serialDevice.serialNumber === usbDevice.serialNumber) {
                return {
                    usbPath: '',
                    serialPath: serialDevice.path
                };
            }
        }
    }
}

interface UsbVersionMinor {
    minor: number;
    subMinor: number;

}

function convertBcdDeviceToUsbVersionMinor(bcdDevice: UHK_DEVICE_IDS_TYPE): UsbVersionMinor {
    const [minor, subMinor] = bcdDevice.toString(10).padStart(2, '0');

    return {
        minor: Number.parseInt(minor, 10),
        subMinor: Number.parseInt(subMinor, 10),
    };
}
