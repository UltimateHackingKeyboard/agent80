import {PortInfo} from '@serialport/bindings-interface';
import {Device} from 'node-hid';
import {SerialPort} from 'serialport';
import os from 'node:os';

export async function findSerialDevicePairOfUsbDevice(usbDevice: Device): Promise<PortInfo | undefined> {
    const serialDevices = await SerialPort.list();
    const usbBcdDevice = usbDevice.release.toString(10);

    for (const serialDevice of serialDevices) {
        if(usbDevice.vendorId.toString() === serialDevice.vendorId
            && usbDevice.productId.toString() === serialDevice.productId.toString()) {
            const platform = os.platform();

            // On macOS
            if( platform=== 'darwin') {
                // On macOS, the serial number is often part of the device name
                if (serialDevice.path.includes(usbBcdDevice)) {
                    return serialDevice;
                }
            }
            // On Windows
            else if(platform === 'win32') {
                if (serialDevice.pnpId?.includes(usbBcdDevice)) {
                    return serialDevice;
                }
            }
            // On Linux and other Unix-like systems
            else if(serialDevice.serialNumber === usbBcdDevice) {
                return serialDevice;
            }
        }
    }
}
