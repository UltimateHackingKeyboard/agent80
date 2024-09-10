import { devices as HidDevices } from 'node-hid';
import {SerialPort} from 'serialport';
import { UhkDeviceProduct } from 'uhk-common';

export async function isUhkDeviceConnected(uhkDevice: UhkDeviceProduct): Promise<boolean> {
    const hidDevices = HidDevices();

    for (const device of hidDevices) {
        if ((uhkDevice.keyboard.some(vidPid => vidPid.vid === device.vendorId && vidPid.pid === device.productId)
                // TODO: remove duplication of isUhkCommunicationInterface
                && ((device.usagePage === 128 && device.usage === 129) || // Old firmware
                (device.usagePage === 65280 && device.usage === 1)) // New firmware
        )
            || uhkDevice.bootloader.some(vidPid => vidPid.vid === device.vendorId && vidPid.pid === device.productId)
        ) {
            return true;
        }
    }

    const serialDevices = await SerialPort.list();

    for (const serialDevice of serialDevices) {
        if (uhkDevice.keyboard.some(vidPid => Number.parseInt(serialDevice.vendorId, 16) === vidPid.vid && Number.parseInt(serialDevice.productId, 16) === vidPid.pid)
            || uhkDevice.bootloader.some(vidPid => Number.parseInt(serialDevice.vendorId, 16) === vidPid.vid && Number.parseInt(serialDevice.productId, 16) === vidPid.pid)
        ) {
            return true;
        }
    }

    return false;
}
