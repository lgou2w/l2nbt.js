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
    parseMojangson,
    parseMojangsonValue
} from '../src/mojangson'

describe('NBT to mojangson', () => {
    it('should to mojangson', async () => {
        let nbt = tagCompound({
            byte: tagByte(127),
            short: tagShort(25600),
            int: tagInt(14586233),
            long: tagLong('2697354127323'),
            float: tagFloat(1.256977),
            double: tagDouble(3.1415926535),
            string: tagString("Hello World"),
            list: tagList([ tagByte(1), tagByte(2) ]),
            barr: tagByteArray([0, 1, 2, 3]),
            iarr: tagIntArray([0, 1, 2, 3]),
            larr: tagLongArray([0, 1, 2, 3]),
            tag: tagCompound({
                display: tagCompound({
                    Name: tagString('Diamond Sword')
                })
            })
        });
        let mojangson = toMojangson(nbt);
        console.log(mojangson); // TODO expect
    });
});

describe('Mojangson to NBT', () => {
    it('should to NBT', async () => {
        let mojangson = '{"byte":127b,"short":25600s,"int":14586233,"long":2697354127323L,"float":1.256977f,"double":3.1415926535d,"string":"Hello World","list":[1b,2b],"barr":[B;0B,1B,2B,3B],"iarr":[I;0,1,2,3],"larr":[L;0L,1L,2L,3L],"tag":{"display":{"Name":\n' +
            '"Diamond Sword"}}}';
        let compound = parseMojangson(mojangson);
        console.log(toMojangson(compound)); // TODO expect
    });
});
