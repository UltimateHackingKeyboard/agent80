/**
 *
 * @param {ArrayLike | Buffer} arr
 * @returns {number}
 */
export default function fromUint16(arr) {
    return (arr[0] * 256) + arr[1]
}