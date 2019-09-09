import { expect } from 'chai';
import { decode, read } from '../src/nbt-reader'
import { encode, write } from '../src/nbt-writer';
import {
    tagByte,
    tagShort,
    tagInt,
    tagLong,
    tagFloat,
    tagDouble,
    tagByteArray,
    tagString,
    tagList,
    tagCompound,
    tagIntArray,
    tagLongArray
} from '../src/nbt';

const TYPE_ID = 'typeId';
const VALUE = 'value';

describe("NBT tag standard create", () => {
    it('should test', async () => {
        expect(tagByte()).to.have.property(TYPE_ID, 1);
        expect(tagShort()).to.have.property(TYPE_ID, 2);
        expect(tagInt()).to.have.property(TYPE_ID, 3);
        expect(tagLong()).to.have.property(TYPE_ID, 4);
        expect(tagFloat()).to.have.property(TYPE_ID, 5);
        expect(tagDouble()).to.have.property(TYPE_ID, 6);
        expect(tagByteArray()).to.have.property(TYPE_ID, 7);
        expect(tagString()).to.have.property(TYPE_ID, 8);
        expect(tagList()).to.have.property(TYPE_ID, 9);
        expect(tagCompound()).to.have.property(TYPE_ID, 10);
        expect(tagIntArray()).to.have.property(TYPE_ID, 11);
        expect(tagLongArray()).to.have.property(TYPE_ID, 12);
    });
    it('should tagList elements are all NBT object', async () => {
        expect(tagList([
            tagByte(1),
            tagByte(2),
            tagByte(3)
        ])).to.have.property(VALUE).with.lengthOf(3);
        // @ts-ignore
        expect(() => tagList([ 1, 2, 3 ])).to.throw(Error);
    });
    it('should tagCompound entry are all NBT object', async () => {
        expect(tagCompound({ foo: tagByte(1) }))
            .to.have.property(VALUE)
            .to.have.property('foo')
            .to.have.property(VALUE, 1);
        // @ts-ignore
        expect(() => tagCompound({ foo: 1 })).to.throw(Error);
    });
});

/**
 * Should bytes
 * Length = 11
 * Content:
 *        10 : TAG_COMPOUND (byte)
 *       0,0 : UTF Length (short) = two zeros represent an empty string
 *          1 : TAG_BYTE (byte)
 *       0,3 : UTF Length (short) = 'foo'.length, three bytes
 *      102 : ASCII (byte) = f
 *      111 : ASCII (byte) = o
 *      111 : ASCII (byte) = o
 *           1 : Value (byte) = 1
 *           0 : TAG_END (byte) = Only TAG_COMPOUND EOF
 */
let nbt = tagCompound({ foo: tagByte(1) });
let nbtBinary = new Int8Array([10, 0, 0, 1, 0, 3, 102, 111, 111, 1, 0]);
let nbtBase64 = 'CgAAAQADZm9vAQA=';

describe('NBT tag read and decode', () => {
    it('should read', async () => {
        let readNBT = read(nbtBinary);
        expect(readNBT.typeId).to.equal(10); // TAG_COMPOUND
        expect(readNBT.value)
            .to.have.property('foo') // Entry foo
            .to.have.property(VALUE, 1) // Entry foo value = 1
    });
    it('should decode', async () => {
        let decodeNBT = decode(nbtBase64);
        expect(decodeNBT.typeId).to.equal(10); // TAG_COMPOUND
        expect(decodeNBT.value)
            .to.have.property('foo') // Entry foo
            .to.have.property(VALUE, 1) // Entry foo value = 1
    });
});

describe('NBT tag write and encode', () => {
    it('should write', async () => {
        let writeNBT = write(nbt);
        expect(writeNBT).to.lengthOf(11); // Length = 11
        expect(writeNBT[0]).to.equal(10); // 10 = TAG_COMPOUND
        expect(writeNBT[3]).to.equal(1); // 1 = TAG_BYTE
        expect(writeNBT[6]).to.equal(102); // 102 = f
        expect(writeNBT[7]).to.equal(111); // 111 = o
        expect(writeNBT[8]).to.equal(111); // 111 = o
        expect(writeNBT[writeNBT.byteLength - 1]).to.equal(0); // TAG_END
    });
    it('should encode', async () => {
        let encodeNBT = encode(nbt);
        expect(encodeNBT).to.equal(nbtBase64);
    });
});
