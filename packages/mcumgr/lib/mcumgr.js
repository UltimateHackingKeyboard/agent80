import {createHash} from 'node:crypto'
import * as cbor from "./cbor.js";
import convertToHex from "./convert-to-hex.js";
import toUint16 from "./to-uint16.js";
import fromUint16 from "./from-uint16.js";

/**
 * MCU management operations
 *
 * @readonly
 * @enum {number}
 */
export const MGMT_OP = Object.freeze({
    READ: 0,
    READ_RSP: 1,
    WRITE: 2,
    WRITE_RSP: 3,
})

/**
 * Target of the MCU management operation
 *
 * @readonly
 * @enum {number}
 */
export const MGMT_GROUP = Object.freeze({
    OS: 0,
    IMAGE: 1,
    STAT: 2,
    CONFIG: 3,
    LOG: 4,
    CRASH: 5,
    SPLIT: 6,
    RUN: 7,
    FS: 8,
    SHELL: 9,
})

/**
 * Operation of the OS group
 *
 * @readonly
 * @enum {number}
 */
export const OS_OPERATION = Object.freeze({
    ECHO: 0,
    CONS_ECHO_CTRL: 1,
    TASK_STAT: 2,
    MP_STAT: 3,
    DATETIME_STR: 4,
    RESET: 5,
})

/**
 * Operation of the IMAGE group
 *
 * @readonly
 * @enum
 */
export const IMAGE_OPERATION = Object.freeze({
    STATE: 0,
    UPLOAD: 1,
    FILE: 2,
    CORE_LIST: 3,
    CORE_LOAD: 4,
    ERASE: 5,
})

const NMP_HEADER_SIZE = 8
// Message transfer unit. TODO: maybe it should be exposed by peripheral
const MTU = 124

export class McuManager {
    #peripheral

    /**
     * @type {number}
     */
    #seq

    constructor(peripheral) {
        this.#peripheral = peripheral
    }

    /**
     * Close the underlying peripheral
     *
     * @returns {Promise<void>}
     */
    async close() {
        return this.#peripheral.close()
    }

    /**
     * Send a message to the device that send it back
     * TODO: Check why the response code (rc) is 8. The mcumgr go program also got this response, so maybe it is a firmware issue
     * TODO: define response type
     */
    async echo(message) {
        return this.sendCommand(MGMT_OP.WRITE, MGMT_GROUP.OS, OS_OPERATION.ECHO, {d: message})
    }

    async imageErase() {
        return this.sendCommand(MGMT_OP.WRITE, MGMT_GROUP.IMAGE, IMAGE_OPERATION.ERASE, {})
    }

    /**
     * Query images from the device
     * TODO: Implement response structure
     * @returns {Promise<*>}
     */
    async imageReadState() {
        return this.sendCommand(MGMT_OP.READ, MGMT_GROUP.IMAGE, IMAGE_OPERATION.STATE)
    }

    /**
     * Upload a firmware/bootloader image to the device
     * @param {Buffer} buffer
     * @returns {Promise<*>}
     */
    async imageUpload(buffer) {
        let written = 0;

        while (written < buffer.length) {
            const message = {
                data: new Uint8Array(),
                off: written
            };

            // set the image length and sha only in the first message packet
            if (written === 0) {
                message.len = buffer.length
                message.sha = new Uint8Array(this.#sha256(buffer))
            }

            const cborEncoded = cbor.encode(message)
            const length = MTU - NMP_HEADER_SIZE - cborEncoded.byteLength
            message.data = new Uint8Array(buffer.subarray(written, written + length))

            const response = await this.sendCommand(MGMT_OP.WRITE, MGMT_GROUP.IMAGE, IMAGE_OPERATION.UPLOAD, message)

            written += length

            // TODO: do we need this if check or not
            if (response.op === MGMT_OP.WRITE_RSP && response.group === MGMT_GROUP.IMAGE && response.id === IMAGE_OPERATION.UPLOAD) {
                if ((response.data?.rc === 0 || response.data?.rc === undefined) && response.data?.off) {
                    written = response.data?.off
                }
            }

            console.log('written: ', written / buffer.length * 100)
        }
    }

    /**
     * Reset/restart the device
     */
    async reset() {
        return this.sendCommand(MGMT_OP.WRITE, MGMT_GROUP.OS, OS_OPERATION.RESET)
    }

    /**
     * @param {MGMT_OP} op
     * @param {MGMT_GROUP} group
     * @param {(OS_OPERATION | IMAGE_OPERATION)} id
     * @param [data]
     * @returns {Promise<*>}
     */
    async sendCommand(op, group, id, data) {
        let encodedData = [];
        if (typeof data !== 'undefined') {
            // the command data is cbor encoded
            const buffer = cbor.encode(data)
            const a = new Uint8Array(buffer)
            encodedData = [...a];
            console.log('cbor data', convertToHex(encodedData))
        }

        // The firs 8 byte is the header
        const message = [
            op,
            0, // it is the flags field we don't use it
            ...toUint16(encodedData.length),
            ...toUint16(group),
            this.#Seq(), // technically it is a random number that makes the testing complicated
            id,
            ...encodedData,
        ];

        console.log('NMP message', convertToHex(message))

        await this.#peripheral.write(message)
        const response = await this.#peripheral.read()
        console.log('nmp response', response)
        const parsedResponse = this.#parseNmpMessage(response)
        console.log("parsed response", parsedResponse)

        return parsedResponse
    }

    /**
     * @param {Buffer} buffer
     * @returns {*}
     */
    #parseNmpMessage(buffer) {
        const [op, flags, length_hi, length_lo, group_hi, group_lo, seq, id] = buffer;

        let data

        // the buffer contains data
        // TODO: Maybe worth validate the length of the data section = header.length
        if (buffer.length > NMP_HEADER_SIZE) {
            const dataSlice = buffer.subarray(8)
            data = cbor.decode( dataSlice.buffer.slice(dataSlice.byteOffset, dataSlice.byteOffset + dataSlice.byteLength))
        }

        return {
            op,
            flags,
            length: fromUint16([length_hi, length_lo]),
            group: fromUint16([group_hi, group_lo]),
            seq,
            id,
            data,
        }
    }

    /**
     * Generates the sequence number of the MCU datagram.
     * If the sequence number is undefined then generate a random seed value.
     * With random seed we just try to prevent the conflict with the previous operation
     * The sequence number is an UInt8 data so if the value is greater than 255 then set it to 0
     */
    #Seq() {
        if (this.#seq === undefined) {
            this.#seq = Math.floor(Math.random() * 255)
        } else {
            this.#seq++;
            if (this.#seq > 255)
                this.#seq = 0
        }

        return this.#seq
    }

    /**
     * Create SHA256 has of the input
     * @param data
     */
    #sha256(data) {
        return createHash('sha256').update(data).digest()
    }
}