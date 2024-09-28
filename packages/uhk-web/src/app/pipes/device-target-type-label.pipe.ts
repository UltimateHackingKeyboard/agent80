import { Pipe, PipeTransform } from '@angular/core';
import { DeviceTargets, DEVICE_TARGETS_LABELS } from 'uhk-common';

@Pipe({
    name: 'deviceTargetTypeLabelPipe',
})
export class DeviceTargetTypeLabelPipe implements PipeTransform {

    transform(deviceTarget: DeviceTargets): string {
        return DEVICE_TARGETS_LABELS[deviceTarget];
    }
}
