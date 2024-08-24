export interface Peripheral {
    close(): Promise<void>;

    open(): Promise<void>;

    read(): Promise<Buffer>;

    write(message: Array<number>): Promise<void>;
}
