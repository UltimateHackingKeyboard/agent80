import { Action } from '@ngrx/store';
import { Dongle } from 'uhk-common';

import { DonglePairingStates } from '../../models';
import * as Device from '../actions/device';
import * as DonglePairing from '../actions/dongle-pairing.action';

export interface State {
    dongle?: Dongle;
    state: DonglePairingStates;
}

export const initialState: State = {
    state: DonglePairingStates.Idle,
};

export function reducer(state = initialState, action: Action): State {
    switch (action.type) {

        case Device.ActionTypes.ConnectionStateChanged: {
            return {
                ...state,
                dongle: (<Device.ConnectionStateChangedAction>action).payload.dongle,
                state: DonglePairingStates.Idle,
            };
        }

        case Device.ActionTypes.SaveToKeyboardFailed: {
            if (state.state !== DonglePairingStates.PairingSuccess) {
                return state;
            }

            return {
                ...state,
                state: DonglePairingStates.PairingFailed,
            };
        }

        case Device.ActionTypes.SaveToKeyboardSuccess: {
            if (state.state !== DonglePairingStates.PairingSuccess) {
                return state;
            }

            return {
                ...state,
                state: DonglePairingStates.Idle,
            };
        }

        case DonglePairing.ActionTypes.StartDonglePairing: {
            return {
                ...state,
                state: DonglePairingStates.Pairing,
            };
        }

        case DonglePairing.ActionTypes.DonglePairingFailed: {
            return {
                ...state,
                state: DonglePairingStates.PairingFailed,
            };
        }

        case DonglePairing.ActionTypes.DonglePairingSuccess: {
            return {
                ...state,
                state: DonglePairingStates.PairingSuccess,
            };
        }

        default:
            return state;
    }
}
