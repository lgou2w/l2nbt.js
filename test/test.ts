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
    tagLongArray,
    resolve
} from '../src/nbt';

const TYPE_ID = '__typeId__';
const VALUE = '__value__';
const ELEMENT = '__elementTypeId__';

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
    it('should list and compound default value test', async () => {
        expect(tagList([
            tagByte(),
            tagByte()
        ])).to.have.property(VALUE)
            .to.lengthOf(2);
        expect(tagCompound({
            foo: tagByte(),
            bar: tagString()
        })).to.have.property(VALUE)
            .to.have.property('bar')
            .to.have.property(VALUE, '') // empty string
    });
});

describe('NBT tag compound create and resolve', () => {
    it('should equivalent', async () => {
        let nbt = tagCompound({
            display: tagCompound({
                Name: tagString('Diamond'),
                Lore: tagList([ tagString('1'), tagString('2') ])
            })
        });
        resolve(nbt);
        expect(nbt.display.Name).to.equal('Diamond');
        expect(nbt.display.Lore).to.lengthOf(2);
        expect(nbt.display.Lore[0]).to.equal('1');
        expect(nbt.display.Name).to.equal(nbt.__value__.display.__value__.Name.__value__);
        nbt.display.Name = 'Apple';
        nbt.display.Lore.push('3');
        expect(nbt.__value__.display.__value__.Name.__value__).to.equal('Apple');
        expect(nbt.__value__.display.__value__.Lore.__value__).to.lengthOf(3);
        expect(nbt.__value__.display.__value__.Lore.__value__[2]).to.equal('3');
        nbt.display = {};
        expect(nbt.__value__.display.__value__).to.be.empty;
        expect(() => nbt.display = 1).to.throw(Error); // Because the prototype of display is TAG_COMPOUND
    });
    it('should list tag entry compound is wrapper', async () => {
        let nbt = tagCompound({
            compounds: tagList([
                tagCompound({ foo: tagByte(0) }),
                tagCompound({ bar: tagByte(1) })
            ]),
            bytes: tagList([ tagByte(0), tagByte(1) ])
        });
        expect(nbt.__value__.compounds.__value__[0].__value__)
            .to.have.property('foo')
            .to.have.property(VALUE, 0);
        expect(nbt.__value__.bytes).to.have.property(ELEMENT, 1); // 1 = TAG_BYTE

        resolve(nbt);
        expect(nbt.bytes).to.lengthOf(2); // two elements
        expect(nbt.bytes[0]).to.equal(0);
        expect(nbt.bytes[1]).to.equal(1);
        expect(nbt.compounds[0].foo).to.equal(0);
        expect(nbt.compounds[1].bar).to.equal(1);
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
        expect(readNBT[TYPE_ID]).to.equal(10); // TAG_COMPOUND
        expect(readNBT[VALUE])
            .to.have.property('foo') // Entry foo
            .to.have.property(VALUE, 1) // Entry foo value = 1
    });
    it('should read Uint8Array', async () => {
        let readNBT = read(new Uint8Array([ 10, 0, 0, 1, 0, 3, 102, 111, 111, 1, 0 ]));
        expect(readNBT.foo).to.equal(1);
    });
    it('should decode', async () => {
        let decodeNBT = decode(nbtBase64);
        expect(decodeNBT[TYPE_ID]).to.equal(10); // TAG_COMPOUND
        expect(decodeNBT[VALUE])
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
