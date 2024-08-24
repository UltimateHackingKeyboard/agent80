import {setTimeout} from 'node:timers/promises'
import {SerialPort} from "serialport";

import crc16 from "./crc16.js";
import toUint16 from "./to-uint16.js";
import convertToHex from "./convert-to-hex.js";
import fromUint16 from "./from-uint16.js";

// The 1st byte of the first message packet of the message
const FIRST_MSG_PACKET_1 = 6
// The 2nd byte of the first message packet of the message
const FIRST_MSG_PACKET_2 = 9
// The 1st byte of the non first message packet of the message
const OTHER_MSG_PACKET_1 = 4
// The 2nd byte of the non first message packet of the message
const OTHER_MSG_PACKET_2 = 20


export default class SerialPeripheral {
    /**
     * @type SerialPort
     */
    #serialPort

    constructor(devicePath) {
        this.#serialPort =  new SerialPort({
            path: devicePath,
            baudRate: 115200,
            autoOpen: false,
        })
/*
        this.#serialPort .on('readable', () => {
            console.log('Data:', this.#serialPort.read())
        })

        this.#serialPort .on('data', data => {
            console.log('DATA: ', data)
        })

        this.#serialPort .on('error', err => {
            console.log('serial error', err)
        })

        this.#serialPort .on('close',() => {
            console.log('serial closed')
        })
 */
    }

    async close() {
        if(!this.#serialPort.isOpen)
            return

        return new Promise((resolve, reject) => {
            this.#serialPort.close(err => {
                if (err) {
                    console.error('Error closing port: ', err.message)
                    return reject(err)
                }

                console.info('Port closed')
                resolve()
            })
        })
    }

    async open() {
        if (this.#serialPort.isOpen)
            return

        return new Promise((resolve, reject) => {
            this.#serialPort.open(err => {
                if (err) {
                    console.error('Error opening port: ', err.message)
                    return reject(err)
                }

                console.info('Port opened')
                resolve()
            })
        })
    }

    async read() {
        let raw = Buffer.alloc(0)

        while (true) {
            const response = this.#serialPort.read()
            let exit = false;

            if (response) {
                for (let i = 0; i < response.length; i++) {
                    const b = response[i]

                    // skip the carriage return
                    if (b === 13)
                        continue

                    // if the byte is line feed then the full response arrived
                    if (b === 10) {
                        exit = true;
                        break
                    }

                    raw = Buffer.concat([raw, Buffer.from([b])])
                }
            }

            if (exit) {
                break;
            }

            await setTimeout(20)
        }

        console.log("raw response:", convertToHex([...raw]))

        // The message packet does not start with the proper header bytes throw an error
        if ((raw[0] !== FIRST_MSG_PACKET_1 || raw[1] !== FIRST_MSG_PACKET_2)
            && (raw[0] !== OTHER_MSG_PACKET_1 || raw[1] !== OTHER_MSG_PACKET_2))
            throw new Error('Invalid response header') // TODO: custom error

        const data = raw.subarray(2)
        const bytes = Buffer.from(data.toString(), "base64")
        const messageLength = fromUint16(bytes.subarray(0, 2))
        const crc = fromUint16(bytes.subarray(bytes.length - 2))
        // TODO: validate message length
        const nmpData = bytes.subarray(2, bytes.length - 2)
        const calculatedCrc = crc16(nmpData)

        if (calculatedCrc !== crc) {
            throw new Error('CRC invalid') // TODO: custom error
        }

        return nmpData;
    }

    /**
     * @param {Uint8Array[]} message
     * @returns {Promise<void>}
     */
    async write(message) {
        const crc = crc16(message)
        // The length is a 2 byte CRC + length of the message
        const dataLength = 2 + message.length
        const data = [
            ...toUint16(dataLength),
            ...message,
            ...toUint16(crc),
        ]

        const base64Encoded = Buffer.from(data).toString('base64')
        console.log('base64 encoded:', base64Encoded)
        const totalLength = base64Encoded.length
        let written = 0

        while (written < totalLength) {
            // Write the packet stat designators.
            // They are different whether we are starting a new packet or continuing one
            if (written === 0) {
               await this.#_write([FIRST_MSG_PACKET_1, FIRST_MSG_PACKET_2])
            } else {
                // Slower platforms take some time to process each segment and have very small receive buffers.
                // Give them a bit of time here
                await setTimeout(20)
                await this.#_write([OTHER_MSG_PACKET_1, OTHER_MSG_PACKET_2])
            }

            // Ensure that the total frame fits into 128 bytes.
            // Base 64 is 3 ascii to 4 base 64 byte encoding, so the number below should be a multiple of 4.
            // We need to save room for the header (2 byte) and carriage return (and possibly LF 2 bytes).
            const writeLen = Math.min(124, totalLength - written)
            await this.#_write(base64Encoded.slice(written, written + writeLen))
            await this.#_write('\n')

            written += writeLen
        }

    }

    /**
     * Drain or flush the message from the serial buffer
     * @returns {Promise<void>}
     */
    async #drain() {
        return new Promise((resolve, reject) => {
            this.#serialPort.drain(err => {
                if (err) {
                    console.error('Error draining: ', err.message)
                    return reject(err)
                }

                console.info('Message drained')
                resolve()
            })
        })
    }

    async #_write(data) {
        await this.open()

        const drained = this.#serialPort.write(data)

        if (drained)
            return;

        return this.#drain()
    }
}