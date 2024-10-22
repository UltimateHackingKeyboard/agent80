export enum DonglePairingStates {
    Idle = 'Idle',
    Pairing = 'Pairing',
    PairingSuccess = 'PairingSuccess',
    PairingFailed = 'PairingFailed',
}

export interface DonglePairingState {
    showDonglePairingPanel: boolean;
    state: DonglePairingStates;
}
