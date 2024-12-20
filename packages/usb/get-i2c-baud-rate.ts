#!/usr/bin/env -S node --loader ts-node/esm --no-warnings=ExperimentalWarning

import Uhk, { errorHandler, yargs } from './src/index.js';

(async function () {

    try {

        const argv = yargs
            .usage('Read I2C Baud rate')
            .argv;

        const { operations } = Uhk(argv);
        const baudRate = await operations.getI2CBaudRate();

        console.log(`requestedBaudRate:${baudRate.requestedBaudRate} | actualBaudRate:${baudRate.actualBaudRate} | I2C0_F:0b${baudRate.i2c0F}`);
    } catch (error) {
        await errorHandler(error);
    }
})();
