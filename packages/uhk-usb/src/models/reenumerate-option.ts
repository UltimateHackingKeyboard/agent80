import { EnumerationModes } from '../constants.js';

export interface ReenumerateOption {
    enumerationMode: EnumerationModes;
    // The USB product id that should appear after the re-enumeration
    productId: number;
    // The USB vendor id that should appear after the re-enumeration
    vendorId: number;
    timeout?: number;
    // USB bcdDevice. Aliases are `bcdVersionNumber` or `release` it depends on OS
    bcdDevice?: number;
}
