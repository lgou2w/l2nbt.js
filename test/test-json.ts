import { expect } from 'chai';
import { toMojangson, parseMojangson } from '../src/mojangson'
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

describe('NBT to mojangson', () => {
    it('should to mojangson', function () {
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
