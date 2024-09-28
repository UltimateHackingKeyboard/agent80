import { assertEnum } from '../assert.js';
import { UhkBuffer } from '../uhk-buffer.js';
import { SerialisationInfo } from './serialisation-info.js';

export enum DeviceTargets {
    Empty = 0,
    UsbRight = 1,
    UsbLeft = 2,
    BLE = 3,
    Dongle = 4,
}

export const DEVICE_TARGETS_LABELS: Readonly<Record<DeviceTargets, string>> = Object.freeze({
    [DeviceTargets.Empty]: 'Empty',
    [DeviceTargets.UsbRight]: 'USB Right',
    [DeviceTargets.UsbLeft]: 'USB Left',
    [DeviceTargets.BLE]: 'BLE',
    [DeviceTargets.Dongle]: 'Dongle',
});

export const DEVICE_TARGET_COUNT_MAX = 22;
const BLE_ADDRESS_LENGTH = 6;
const ADDRESS_SEPARATOR = ':';

export class DeviceTarget {
    @assertEnum(DeviceTargets) type: DeviceTargets;

    address: string;
    name: string;

    constructor(other?: DeviceTarget) {
        if (other) {
            this.type = other.type;
            this.address = other.address;
            this.name = other.name;
        }
    }

    fromJsonObject(jsonObject: any, serialisationInfo: SerialisationInfo): DeviceTarget {
        this.type = DeviceTargets[<string>jsonObject.type];
        if (this.hasAddress()) {
            this.address = jsonObject.address;
        }
        this.name = jsonObject.name;

        return this;
    }

    fromBinary(buffer: UhkBuffer, serialisationInfo: SerialisationInfo): DeviceTarget {
        this.type = buffer.readUInt8();

        if (this.hasAddress()) {
            const address = [];

            for(let i = 0; i < BLE_ADDRESS_LENGTH; i++) {
                address.push(buffer.readUInt8());
            }

            this.address = address.map(x => x.toString(16)).join(ADDRESS_SEPARATOR);
        }

        this.name = buffer.readString();

        return this;
    }

    toJsonObject(): any {
        const json: any = {
            type: DeviceTargets[this.type],
            name: this.name,
        };

        if(this.hasAddress()) {
            json.address = this.address;
        }

        return json;
    }

    toBinary(buffer: UhkBuffer): void {
        buffer.writeUInt8(this.type);

        if (this.hasAddress()) {
            const address = this.address.split(ADDRESS_SEPARATOR);

            for(let i = 0; i < BLE_ADDRESS_LENGTH; i++) {
                const segment = Number.parseInt(address[i], 16) || 0;
                buffer.writeUInt8(segment);
            }
        }

        buffer.writeString(this.name);
    }

    private hasAddress(): boolean {
        return this.type === DeviceTargets.BLE || this.type === DeviceTargets.Dongle;
    }
}

export function emptyDeviceTarget(): DeviceTarget {
    const deviceTarget = new DeviceTarget();
    deviceTarget.type = DeviceTargets.Empty;
    deviceTarget.name = '';

    return deviceTarget;
}

export function defaultDeviceTargets(): DeviceTarget[] {
    const usbRightDeviceTarget = new DeviceTarget();
    usbRightDeviceTarget.type = DeviceTargets.UsbRight;
    usbRightDeviceTarget.name = 'My PC';

    const deviceTargets: DeviceTarget[] = [
        usbRightDeviceTarget
    ];

    for (let i = deviceTargets.length; i < DEVICE_TARGET_COUNT_MAX; i++) {
        deviceTargets.push(emptyDeviceTarget());
    }

    return deviceTargets;
}
