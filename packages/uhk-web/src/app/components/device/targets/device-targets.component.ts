import { ChangeDetectorRef } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DragulaService } from '@ert78gb/ng2-dragula';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DeviceTarget } from 'uhk-common';

import { RenameDeviceTargetAction, ReorderDeviceTargetsAction } from '../../../store/actions/user-config';
import { AppState, getDeviceTargets } from '../../../store/index';

@Component({
    selector: 'device-targets',
    templateUrl: './device-targets.component.html',
    styleUrls: ['./device-targets.component.scss'],
    host: {
        'class': 'container-fluid full-screen-component'
    },
})
export class DeviceTargetsComponent implements OnInit, OnDestroy {
    faBullseye = faBullseye;

    targets: DeviceTarget[] = [] as DeviceTarget[];

    dragAndDropGroup = 'DEVICE_TARGET';

    private targetsSubscription: Subscription;

    constructor(private dragulaService: DragulaService,
                private cdRef: ChangeDetectorRef,
                private store: Store<AppState>) {

        dragulaService.createGroup(this.dragAndDropGroup, {
            moves: (el, container, handle) => {
                if (!handle) {
                    return false;
                }

                let element = handle;
                while (element) {
                    if (element.classList.contains('movable')) {
                        return true;
                    }
                    element = element.parentElement;
                }

                return false;
            }
        });
    }

    ngOnInit(): void {
        this.targetsSubscription = this.store.select(getDeviceTargets)
            .subscribe(deviceTargets => {
                this.targets = deviceTargets;
                this.cdRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.dragulaService.destroy(this.dragAndDropGroup);
        if(this.targetsSubscription) {
            this.targetsSubscription.unsubscribe();
        }
    }

    renameTarget(index: number, newName: string): void {
        this.store.dispatch(new RenameDeviceTargetAction({
            index,
            newName,
        }));
    }

    targetsReordered(deviceTargets: DeviceTarget[]): void {
        this.store.dispatch(new ReorderDeviceTargetsAction(deviceTargets));
    }
}
