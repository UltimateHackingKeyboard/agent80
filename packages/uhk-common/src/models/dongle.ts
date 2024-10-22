export interface Dongle {
    bleAddress?: string;

    keyboardBleAddress?: string;
    /**
     * True if more than 1 UHK dongle connected.
     */
    multiDevice: boolean;

    serialNumber: string;
}
