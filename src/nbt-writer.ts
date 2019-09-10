import { btoa } from './base64'
import { NBT, NBTMetadata } from './nbt'

const CAPACITY_DEFAULT = 32; // Default: 32 Bytes

export class NBTWriter {

    private readonly littleEndian?: boolean;
    private view: Int8Array;
    private data: DataView;
    private buffer: ArrayBuffer;
    private pos: number = 0;

    constructor(littleEndian?: boolean) {
        this.buffer = new ArrayBuffer(CAPACITY_DEFAULT);
        this.view = new Int8Array(this.buffer);
        this.data = new DataView(this.buffer);
        this.littleEndian = littleEndian;
    }

    private ensureCapacity(minCapacity: number) {
        if (minCapacity - this.buffer.byteLength > 0) {
            let oldCapacity = this.buffer.byteLength;
            let newCapacity = oldCapacity << 1;
            if (newCapacity - minCapacity < 0)
                newCapacity = minCapacity;
            let oldView = this.view;
            let oldData = new Array<number>();
            let newBuffer = new ArrayBuffer(newCapacity);
            let newView = new Int8Array(newBuffer);
            for (let i = 0; i < oldCapacity; i++)
                oldData.push(oldView[i]);
            newView.set(oldData);
            this.buffer = newBuffer;
            this.view = newView;
            this.data = new DataView(newBuffer);
        }
    }

    writtenView(): Int8Array { return this.view }
    writtenLength(): number { return this.pos }

    writeByte(value: number) {
        this.ensureCapacity(this.pos + 1);
        this.data.setInt8(this.pos, value);
        this.pos += 1;
    }

    writeShort(value: number) {
        this.ensureCapacity(this.pos + 2);
        this.data.setInt16(this.pos, value, this.littleEndian);
        this.pos += 2;
    }

    writeInt(value: number) {
        this.ensureCapacity(this.pos + 4);
        this.data.setInt32(this.pos, value, this.littleEndian);
        this.pos += 4;
    }

    writeLong(value: number | string | bigint) {
        this.ensureCapacity(this.pos + 8);
        if (typeof value !== 'bigint')
            value = BigInt(value);
        this.data.setBigInt64(this.pos, value, this.littleEndian);
        this.pos += 8;
    }

    writeFloat(value: number) {
        this.ensureCapacity(this.pos + 4);
        this.data.setFloat32(this.pos, value, this.littleEndian);
        this.pos += 4;
    }

    writeDouble(value: number) {
        this.ensureCapacity(this.pos + 8);
        this.data.setFloat64(this.pos, value, this.littleEndian);
        this.pos += 8;
    }

    writeString(value: string) {
        const length = value.length;
        let utflen = 0;
        for (let i = 0; i < length; i++) {
            let c = value.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                utflen++;
            } else if (c > 0x07FF) {
                utflen += 3;
            } else {
                utflen += 2;
            }
        }

        if (utflen > 65535)
            throw new Error(`encoded string too long: ${utflen} bytes`);

        this.writeByte((utflen >>> 8) & 0xFF);
        this.writeByte((utflen >>> 0) & 0xFF);

        for (let i = 0; i < length; i++) {
            let c = value.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                this.writeByte(c);
            } else if (c > 0x07FF) {
                this.writeByte((0xE0 | ((c >> 12) & 0x0F)));
                this.writeByte((0x80 | ((c >> 6) & 0x3F)));
                this.writeByte((0x80 | ((c >> 0) & 0x3F)));
            } else {
                this.writeByte((0xC0 | ((c >> 6) & 0x1F)));
                this.writeByte((0x80 | ((c >> 0) & 0x3F)));
            }
        }
    }

    toString(): string {
        return `NBTWriter { pos: ${this.pos}, littleEndian: ${this.littleEndian} }`;
    }
}

const writeMetadata = (writer: NBTWriter, metdata: NBTMetadata) => {
    writer.writeByte(metdata.typeId);
    writer.writeString(metdata.name);
};

const writeValue = (writer: NBTWriter, nbt: NBT) => {
    let typeId = nbt.__typeId__;
    switch (typeId) {
        case 1:
            writer.writeByte(nbt.__value__); break;
        case 2:
            writer.writeShort(nbt.__value__); break;
        case 3:
            writer.writeInt(nbt.__value__); break;
        case 4:
            writer.writeLong(nbt.__value__); break;
        case 5:
            writer.writeFloat(nbt.__value__); break;
        case 6:
            writer.writeDouble(nbt.__value__); break;
        case 7:
        case 11:
        case 12:
            writeArray(writer, nbt.__value__, typeId); break;
        case 8:
            writer.writeString(nbt.__value__); break;
        case 9:
            writeList(writer, nbt); break;
        case 10:
            writeCompound(writer, nbt.__value__); break;
        default:
            throw new Error(`Unsupported nbt type: ${typeId}`)
    }
};

const writeArray = (writer: NBTWriter, value: NBT[], id: number) => {
    writer.writeInt(value.length);
    for (let i = 0; i < value.length; i++) {
        let v = value[i].__value__;
        switch (id) {
            case 7:
                writer.writeByte(v); break;
            case 11:
                writer.writeInt(v); break;
            case 12:
                writer.writeLong(v); break;
        }
    }
};

const writeList = (writer: NBTWriter, tagList: NBT) => {
    let elementTypeId = tagList.__elementTypeId__;
    let values = tagList.__value__;
    if (elementTypeId === undefined) { // Only TAG_COMPOUND elementType
        writer.writeByte(values.length > 0 ? values[0].__typeId__ : 0);
        writer.writeInt(values.length);
        for (let v of values)
            writeValue(writer, v)
    } else {
        // Pure list entry
        writer.writeByte(elementTypeId);
        writer.writeInt(values.length);
        for (let v of values)
            writeValue(writer, { __typeId__: elementTypeId, __value__: v, __nbt__: true })
    }
};

const writeCompound = (writer: NBTWriter, value: NBT) => {
    for (let k in value) {
        let v = value[k];
        writeMetadata(writer, { typeId: v.__typeId__, name: k });
        writeValue(writer, v);
    }
    writer.writeByte(0); // TAG_END
};

export function encode(nbt: NBT, littleEndian?: boolean): string {
    let binaryNBT = write(nbt, littleEndian);
    let array = new Array<string>();
    for (let i = 0; i < binaryNBT.byteLength; i++) {
        let c = String.fromCharCode(binaryNBT[i]);
        array.push(c);
    }
    let value = array.join('');
    return btoa(value);
}

export function write(nbt: NBT, littleEndian?: boolean): Int8Array {
    let writer = new NBTWriter(littleEndian);
    writeMetadata(writer, { typeId: nbt.__typeId__, name: '' }); // ROOT no name
    writeValue(writer, nbt);
    let view = writer.writtenView();
    let copy = new Int8Array(writer.writtenLength());
    let array = new Array<number>(copy.byteLength);
    for (let i = 0; i < copy.byteLength; i++)
        array[i] = view[i];
    copy.set(array);
    return copy;
}
