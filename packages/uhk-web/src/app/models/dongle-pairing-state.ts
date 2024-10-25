export enum DonglePairingStates {
    Deleting = 'Deleting',
    DeletingSuccess = 'DeletingSuccess',
    DeletingFailed = 'DeletingFailed',
    Idle = 'Idle',
    Pairing = 'Pairing',
    PairingSuccess = 'PairingSuccess',
    PairingFailed = 'PairingFailed',
}

export interface DonglePairingState {
    showDonglePairingPanel: boolean;
    state: DonglePairingStates;
}
