import * as cbor from "./cbor.js";
import { SerialPort } from 'serialport'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import util from 'node:util'
import {McuManager} from "./mcumgr.js";
import SerialPeripheral from "./serial-peripheral.js";

const buffer = fs.readFileSync('/home/robi//Downloads/Telegram Desktop/firmware/devices/uhk-80-right/firmware.bin')

const devices = await SerialPort.list()

const device = devices.find(x => x.vendorId?.toLowerCase() === '1d50' && x.productId?.toLowerCase() === '6125')

if (!device) {
    console.error("Can't find device")
    process.exit(1)
}
console.log(device)

// const peripheral = new SerialPeripheral('/tmp/ttyV0')
const peripheral = new SerialPeripheral(device.path)
const mcuManager = new McuManager(peripheral)


// const response = await mcuManager.imageErase()
const response = await mcuManager.imageUpload(buffer)
// const response = await mcuManager.imageReadState()
// await mcuManager.reset()

console.log(util.inspect(response, {depth: 10}))

await mcuManager.close()