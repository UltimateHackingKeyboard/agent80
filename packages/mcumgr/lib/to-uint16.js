/**
 * Convert a number to UInt16 big edian encoded array
 *
 * @param {number} data
 * @returns {number[]}
 */
export default function toUint16(data) {
    return [
        data >> 8,
        data & 255,
    ]
}