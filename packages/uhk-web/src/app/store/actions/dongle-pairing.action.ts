import { Action } from '@ngrx/store';

export enum ActionTypes {
    StartDonglePairing = '[dongle-pairing] start dongle pairing',
    DonglePairingSuccess = '[dongle-pairing] dongle pairing success',
    DonglePairingFailed = '[dongle-pairing] dongle pairing failed',
}

export class StartDonglePairingAction implements Action {
    type = ActionTypes.StartDonglePairing;
}

export class DonglePairingSuccessAction implements Action {
    type = ActionTypes.DonglePairingSuccess;

    // the payload is the dongle BLE Address
    constructor(public payload: string) {}
}

export class DonglePairingFailedAction implements Action {
    type = ActionTypes.DonglePairingFailed;

    constructor(public payload: string) {}
}

export type Actions
    = StartDonglePairingAction
    | DonglePairingSuccessAction
    | DonglePairingFailedAction
    ;
