import { atob } from './base64'
import {
    NBT,
    NBTMetadata,
    resolve,
    tagByte,
    tagByteArray,
    tagCompound,
    tagDouble,
    tagFloat,
    tagInt,
    tagIntArray,
    tagList,
    tagLong,
    tagLongArray,
    tagShort,
    tagString
} from './nbt'

export class NBTReader {

    private readonly data: DataView;
    private readonly length: number;
    private readonly littleEndian?: boolean;
    private pos = 0;

    constructor(data: DataView, littleEndian?: boolean) {
        this.data = data;
        this.length = data.byteLength;
        this.littleEndian = littleEndian;
    }

    readByte(): number {
        let v = this.data.getInt8(this.pos);
        this.pos += 1;
        return v;
    }

    readUnsignedByte(): number {
        let v = this.readByte();
        if (v < 0)
            throw new Error('EOF');
        return v;
    }

    readShort(): number {
        let v = this.data.getInt16(this.pos, this.littleEndian);
        this.pos += 2;
        return v;
    }

    readInt(): number {
        let v = this.data.getInt32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }

    readLong(): bigint {
        let v = this.data.getBigInt64(this.pos, this.littleEndian);
        this.pos += 8;
        return v;
    }

    readFloat(): number {
        let v = this.data.getFloat32(this.pos, this.littleEndian);
        this.pos += 4;
        return v;
    }

    readDouble(): number {
        let v = this.data.getFloat64(this.pos, this.littleEndian);
        this.pos += 8;
        return v;
    }

    readString(): string {
        let length = this.readShort();
        if (length <= 0)
            return '';
        let value = new Uint8Array(length);
        for (let i = 0; i < length; i++)
            value[i] = this.readByte();
        let out = '';
        let c, c2, c3;
        let i = 0;
        while (i < length) {
            c = value[i++];
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    out += String.fromCharCode(c);
                    break;
                case 12: case 13:
                    c2 = value[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F));
                    break;
                case 14:
                    c2 = value[i++];
                    c3 = value[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((c2 & 0x3F) << 6) | ((c3 & 0x3F) << 0)
                    );
                    break;
            }
        }
        return out;
    }

    toString(): string {
        return `NBTReader { pos: ${this.pos}, length: ${this.length}, littleEndian: ${this.littleEndian} }`;
    }
}

const readMetadata = (reader: NBTReader): NBTMetadata | null => {
    let id = reader.readUnsignedByte();
    if (id === 0)
        return null;
    return { typeId: id, name: reader.readString() };
};

const readValue = (reader: NBTReader, id: number): NBT => {
    switch (id) {
        case 1:
            return tagByte(reader.readByte());
        case 2:
            return tagShort(reader.readShort());
        case 3:
            return tagInt(reader.readInt());
        case 4:
            return tagLong(reader.readLong());
        case 5:
            return tagFloat(reader.readFloat());
        case 6:
            return tagDouble(reader.readDouble());
        case 7:
        case 11:
        case 12:
            return readArray(reader, id);
        case 8:
            return tagString(reader.readString());
        case 9:
            return readList(reader);
        case 10:
            return readCompound(reader);
        default:
            throw new Error(`Unsupported nbt id: ${id}`);
    }
};

const readArray = (reader: NBTReader, id: number): NBT => {
    let length = reader.readInt();
    let array = new Array<number>();
    for (let i = 0; i < length; i++) {
        let value;
        switch (id) {
            case 7:
                value = reader.readByte(); break;
            case 11:
                value = reader.readInt(); break;
            case 12:
                value = reader.readLong(); break;
        }
        array.push(value);
    }
    switch (id) {
        case 7:
            return tagByteArray(array);
        case 11:
            return tagIntArray(array);
        case 12:
            return tagLongArray(array);
        default:
            throw new Error('never');
    }
};

const readList = (reader: NBTReader): NBT => {
    let elementTypeId = reader.readUnsignedByte();
    let length = reader.readInt();
    let array = new Array<NBT>();
    if (elementTypeId !== 0)
        for (let i = 0; i < length; i++)
            array.push(readValue(reader, elementTypeId));
    return tagList(array);
};

const readCompound = (reader: NBTReader): NBT => {
    let compound = {};
    let value;
    let metadata = readMetadata(reader);
    while (metadata && metadata.typeId !== 0) {
        value = readValue(reader, metadata.typeId);
        compound[metadata.name] = value;
        metadata = readMetadata(reader);
    }
    return tagCompound(compound);
};

export function decode(base64EncodedNBT: string, littleEndian?: boolean): NBT {
    let decode = atob(base64EncodedNBT);
    let array = new Int8Array(new ArrayBuffer(decode.length));
    for (let i = 0; i < array.length; i++)
        array[i] = decode.charCodeAt(i);
    return read(array, littleEndian);
}

export function read(binaryNBT: ArrayBuffer | Int8Array | Uint8Array, littleEndian?: boolean): NBT {
    if (binaryNBT instanceof Int8Array || binaryNBT instanceof Uint8Array)
        binaryNBT = binaryNBT.buffer;
    let reader = new NBTReader(new DataView(binaryNBT), littleEndian);
    let rootMetadata = readMetadata(reader);
    if (rootMetadata === null)
        throw new Error('Invalid root nbt metadata.');
    let nbt = readValue(reader, rootMetadata.typeId);
    return resolve(nbt);
}
