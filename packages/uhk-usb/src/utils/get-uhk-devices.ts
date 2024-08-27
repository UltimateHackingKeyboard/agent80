import { Device, devices } from 'node-hid';
import { UHK_VENDOR_ID } from 'uhk-common';

/**
 * Returns with UHK USB HID devices
 */
export function getUhkDevices(vendorId: number = UHK_VENDOR_ID): Array<Device> {
    return devices().filter(x => x.vendorId === vendorId);
}
