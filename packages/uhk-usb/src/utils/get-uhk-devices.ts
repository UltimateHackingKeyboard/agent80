import { Device, devices } from 'node-hid';
import { UHK_VENDOR_ID_OLD } from 'uhk-common';

export function getUhkDevices(vendorId: number = UHK_VENDOR_ID_OLD): Array<Device> {
    return devices().filter(x => x.vendorId === vendorId);
}
