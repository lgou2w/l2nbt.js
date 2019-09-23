import { expect } from 'chai';
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
import {
    toMojangson,
    parseMojangson
} from '../src/mojangson'

describe('NBT to mojangson', () => {
    it('should equal', async () => {
        expect(toMojangson(tagByte(123))).to.equal('123b'); // byte : suffix = b
        expect(toMojangson(tagShort(456))).to.equal('456s'); // short : suffix = s
        expect(toMojangson(tagInt(123456))).to.equal('123456'); // int : no suffix
        expect(toMojangson(tagLong(233))).to.equal('233L'); // long : suffix = L  Uppercase!
        expect(toMojangson(tagFloat(1.2456))).to.equal('1.2456f'); // float : suffix = f
        expect(toMojangson(tagDouble(3.14159))).to.equal('3.14159d'); // double : suffix = d
        expect(toMojangson(tagString('Hello'))).to.equal("\"Hello\""); // string : escape double quotes
        expect(toMojangson(tagByteArray([0, 1, 2]))).to.equal('[B;0B,1B,2B]'); // byte array
        expect(toMojangson(tagIntArray([0, 1, 2]))).to.equal('[I;0,1,2]'); // int array
        expect(toMojangson(tagLongArray([0, 1, 2]))).to.equal('[L;0L,1L,2L]'); // long array
        expect(toMojangson(tagList([tagByte(1), tagByte(2)]))).to.equal('[1b,2b]'); // list
        expect(toMojangson(tagCompound({ foo: tagByte(1) }))).to.equal('{\"foo\":1b}');
        expect(toMojangson(tagCompound({}))).to.equal('{}');
    });
});

describe('Mojangson to NBT', () => {
    it('should std', async () => {
        let mojangson = '{"byte":127b,"short":25600s,"int":14586233,"long":2697354127323L,"float":1.256977f,"double":3.1415926535d,"string":"Hello World","list":[1b,2b],"barr":[B;0B,1B,2B,3B],"iarr":[I;0,1,2,3],"larr":[L;0L,1L,2L,3L],"tag":{"display":{"Name":"Diamond Sword"}}}';
        let compound = parseMojangson(mojangson);
        expect(compound.byte).to.equal(127);
        expect(compound.short).to.equal(25600);
        expect(compound.int).to.equal(14586233);
        expect(compound.long).to.equal(BigInt('2697354127323'));
        expect(compound.float).to.equal(1.256977);
        expect(compound.double).to.equal(3.1415926535);
        expect(compound.string).to.equal('Hello World');
        expect(compound.list).to.have.same.members([1, 2]);
        expect(compound.barr).to.have.same.members([0, 1, 2, 3]);
        expect(compound.iarr).to.have.same.members([0, 1, 2, 3]);
        expect(compound.larr).to.have.same.members([BigInt(0), BigInt(1), BigInt(2), BigInt(3)]);
        expect(compound.tag.display.Name).to.equal('Diamond Sword');
    });
});
