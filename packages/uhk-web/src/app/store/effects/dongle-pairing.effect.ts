import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType} from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { NotificationType } from 'uhk-common';

import { DeviceRendererService } from '../../services/device-renderer.service';
import { ShowNotificationAction } from '../actions/app';
import { SaveConfigurationAction } from '../actions/device';
import {
    ActionTypes,
    DonglePairingFailedAction,
    DonglePairingSuccessAction,
} from '../actions/dongle-pairing.action';

@Injectable()
export class DonglePairingEffect {
    startDonglePairing$ = createEffect(() => this.actions$
        .pipe(
            ofType(ActionTypes.StartDonglePairing),
            tap(() => this.deviceRendererService.startDonglePairing()),
        ),
    { dispatch: false }
    );

    donglePairingFailed$ = createEffect(() => this.actions$
        .pipe(
            ofType<DonglePairingFailedAction>(ActionTypes.DonglePairingFailed),
            map(action => {
                return new ShowNotificationAction({
                    type: NotificationType.Error,
                    message: action.payload
                });
            })
        ));

    donglePairingSuccess$ = createEffect(() => this.actions$
        .pipe(
            ofType<DonglePairingSuccessAction>(ActionTypes.DonglePairingSuccess),
            map(() => {
                return new SaveConfigurationAction(true);
            })
        ));

    constructor(private actions$: Actions,
                private deviceRendererService: DeviceRendererService,
    ){}
}
