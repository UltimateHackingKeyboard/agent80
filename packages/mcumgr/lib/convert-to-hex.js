/**
 * Convert the byte array to hexadecimal string
 * @param {Array<number>} arr
 *
 * @returns {string}
 */
export default function convertToHex(arr) {
    return arr.map(x => x.toString(16).padStart(2, '0')).join(' ')
}