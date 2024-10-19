import { devicesAsync, Device } from 'node-hid';
import { UHK_DONGLE } from 'uhk-common';

import { isUhkCommunicationUsage } from '../util.js';
export const MULTIPLE_DONGLE_CONNECTED_ERROR_MESSAGE = 'Multiple dongle aren\'t supported yet, so please connect only a single dongle to proceed further.';

export async function getCurrentUhkDongleHID(): Promise<Device | undefined> {
    const hidDevices = await devicesAsync();

    const devices = hidDevices.filter(device => {
        return UHK_DONGLE.keyboard.some(vidPid => {
            return vidPid.vid === device.vendorId
                && vidPid.pid == device.productId
            && isUhkCommunicationUsage(device);
        });
    });

    if (devices.length === 0) {
        return;
    }

    if (devices.length === 1)
        return devices[0];

    throw new Error(MULTIPLE_DONGLE_CONNECTED_ERROR_MESSAGE);
}
