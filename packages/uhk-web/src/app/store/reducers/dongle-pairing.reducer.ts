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
            if (state.state === DonglePairingStates.Pairing) {
                return {
                    ...state,
                    state: DonglePairingStates.PairingFailed,
                };
            }

            if (state.state === DonglePairingStates.Deleting) {
                return {
                    ...state,
                    state: DonglePairingStates.DeletingFailed,
                };
            }

            return state;
        }

        case DonglePairing.ActionTypes.DeleteHostConnection: {
            return {
                ...state,
                state: DonglePairingStates.Deleting,
            };
        }

        case DonglePairing.ActionTypes.DeleteHostConnectionFailed: {
            return {
                ...state,
                state: DonglePairingStates.DeletingFailed,
            };
        }

        case DonglePairing.ActionTypes.DeleteHostConnectionSuccess: {
            return {
                ...state,
                state: DonglePairingStates.DeletingSuccess,
            };
        }

        case Device.ActionTypes.SaveToKeyboardSuccess: {
            if (state.state === DonglePairingStates.PairingSuccess || state.state === DonglePairingStates.DeletingSuccess) {
                return {
                    ...state,
                    state: DonglePairingStates.Idle,
                };
            }

            return state;
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

export const isDonglePairing = (state: State): boolean => state.state === DonglePairingStates.Pairing || state.state === DonglePairingStates.PairingSuccess;
export const getDongle = (state: State): Dongle => state.dongle;
