import {
    NBT,
    tag,
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
} from './nbt';

export function toMojangson(nbt: NBT): string {
    let json = new Array<string>();
    toJsonValue(json, nbt);
    return json.join('');
}

const toJsonValue = (json: Array<string>, nbt: NBT) => {
    let typeId = nbt.__typeId__;
    switch (typeId) {
        case 1: json.push(`${nbt.__value__}b`); break; // byte
        case 2: json.push(`${nbt.__value__}s`); break; // short
        case 3: json.push(`${nbt.__value__}`); break; // int
        case 4: json.push(`${nbt.__value__.toString(10)}L`); break; // long
        case 5: json.push(`${nbt.__value__}f`); break; // float
        case 6: json.push(`${nbt.__value__}d`); break; // double
        case 7:
        case 11:
        case 12:
            toJsonArray(json, nbt, typeId); break; // typed array: byte array, int array, long array
        case 8:
            json.push(`\"${nbt.__value__.replace(/\"/g, "\\\"")}\"`); break; // string
        case 9:
            toJsonList(json, nbt); break; // list
        case 10:
            toJsonCompound(json, nbt); break; // compound
        default:
            throw new Error(`Unsupported nbt type: ${typeId}`);
    }
};

const toJsonCompound = (json: Array<string>, nbt: NBT) => {
    json.push('{');
    for (let k in nbt.__value__) {
        let v : NBT = nbt.__value__[k];
        json.push(`\"${k}\":`); // -> "KEY":
        toJsonValue(json, v);
        json.push(',');
    }
    json.pop(); // remove last comma
    json.push('}');
};

const toJsonList = (json: Array<string>, nbt: NBT) => {
    json.push('[');
    let elementTypeId = nbt.__elementTypeId__;
    let length = nbt.__value__.length;
    let i = 0;
    for (let item of nbt.__value__) {
        if (elementTypeId !== undefined) // Pure list entry
            item = tag(item, elementTypeId);
        if (i >= 1 && i < length)
            json.push(',');
        toJsonValue(json, item);
        i++;
    }
    json.push(']');
};

const toJsonArray = (json: Array<string>, nbt: NBT, typeId: number) => {
    json.push('[');
    let suffix;
    switch (typeId) {
        case 7: json.push('B;'); suffix = 'B'; break; // byte array
        case 11: json.push('I;'); suffix = ''; break; // int array
        case 12: json.push('L;'); suffix ='L'; break; // long array
        default:
            throw new Error(`Unsupported nbt typed array: ${typeId}`);
    }
    let length = nbt.__value__.length;
    let i = 0;
    for (let v of nbt.__value__) {
        if (i >= 1 && i < length)
            json.push(',');
        if (v instanceof BigInt)
            v = v.toString(10);
        json.push(`${v}${suffix}`);
        i++;
    }
    json.push(']');
};

class StringReader {

    private static SYNTAX_ESCAPE = '\\';
    private static SYNTAX_DOUBLE_QUOTE = '"';
    private static SYNTAX_SINGLE_QUOTE = '\'';

    private static isQuotedStringStart = (c) =>
        c === StringReader.SYNTAX_DOUBLE_QUOTE ||
        c === StringReader.SYNTAX_SINGLE_QUOTE;
    private static isAllowedInUnquotedString = (c) =>
        (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
        c === '_' || c === '-' || c === '.' || c === '+';

    private readonly str : string;
    cursor = 0;

    constructor(str: string) {
        this.str = str;
    }

    canRead = (length: number = 1) => this.cursor + length <= this.str.length;
    peek = (offset: number = 0) => this.str.charAt(this.cursor + offset);
    read = () => this.str[this.cursor++];
    skip = () => { this.cursor++ };
    skipWhitespace = () => {
        while (this.canRead() && /\s/.test(this.peek())) // whitespace
            this.skip();
    };
    readUnquotedString = (): string => {
        let start = this.cursor;
        while (this.canRead() && StringReader.isAllowedInUnquotedString(this.peek()))
            this.skip();
        return this.str.substring(start, this.cursor);
    };
    readQuotedString = (): string => {
        if (!this.canRead())
            return '';
        let next = this.peek();
        if (!StringReader.isQuotedStringStart(next))
            throw new Error('Expected quote to start a string');
        this.skip();
        return this.readStringUntil(next);
    };
    readStringUntil = (terminator: string): string => {
        let result = new Array<string>();
        let escaped = false;
        while (this.canRead()) {
            let c = this.read();
            if (escaped) {
                if (c === terminator || c === StringReader.SYNTAX_ESCAPE) {
                    result.push(c);
                    escaped = false;
                } else {
                    this.cursor -= 1;
                    throw new Error(`Invalid escape sequence '${c}' in quoted string`);
                }
            } else if (c === StringReader.SYNTAX_ESCAPE) {
                escaped = true;
            } else if (c === terminator) {
                return result.join('');
            } else {
                result.push(c)
            }
        }
        throw new Error('Unclosed quoted string');
    };
    readString = (): string => {
        if (!this.canRead())
            return '';
        let next = this.peek();
        if (StringReader.isQuotedStringStart(next)) {
            this.skip();
            return this.readStringUntil(next);
        }
        return this.readUnquotedString();
    };
    expect = (c: string) => {
        if (!this.canRead() || this.peek() !== c)
            throw new Error(`Expected '${c}'`);
        this.skip();
    }
}

class MojangsonParser {

    private static DOUBLE_PATTERN_NOSUFFIX = /^[-+]?(?:[0-9]+[.]|[0-9]*[.][0-9]+)(?:e[-+]?[0-9]+)?$/i;
    private static DOUBLE_PATTERN = /^[-+]?(?:[0-9]+[.]|[0-9]*[.][0-9]+)(?:e[-+]?[0-9]+)?d$/i;
    private static FLOAT_PATTERN = /^[-+]?(?:[0-9]+[.]?|[0-9]*[.][0-9]+)(?:e[-+]?[0-9]+)?f$/i;
    private static BYTE_PATTERN = /^[-+]?(?:0|[1-9][0-9]*)b$/i;
    private static LONG_PATTERN = /^[-+]?(?:0|[1-9][0-9]*)l$/i;
    private static SHORT_PATTERN= /^[-+]?(?:0|[1-9][0-9]*)s$/i;
    private static INT_PATTERN = /^[-+]?(?:0|[1-9][0-9]*)$/;

    private readonly reader: StringReader;

    constructor(reader: StringReader) {
        this.reader = reader;
    }

    readSingleStruct = (): NBT => {
        let compound = this.readStruct();
        this.reader.skipWhitespace();
        if (this.reader.canRead())
            throw new Error('Unexpected trailing data');
        return compound;
    };

    readValue = (): NBT => {
        this.reader.skipWhitespace();
        if (!this.reader.canRead())
            throw new Error('Expected value');
        switch (this.reader.peek()) {
            case '{': return this.readStruct();
            case '[': return this.readList();
            default: return this.readTypedValue();
        }
    };

    private readKey = (): string => {
        this.reader.skipWhitespace();
        if (!this.reader.canRead())
            throw new Error('Expected key');
        return this.reader.readString();
    };

    private readTypedValue = (): NBT => {
        this.reader.skipWhitespace();
        let start = this.reader.cursor;
        if (this.reader.peek() === '"') {
            return tagString(this.reader.readQuotedString());
        } else {
            let str = this.reader.readUnquotedString();
            if (str.length <= 0) {
                this.reader.cursor = start;
                throw new Error('Expected value');
            }
            return this.type(str);
        }
    };

    private type = (str: string): NBT => {
        if (MojangsonParser.FLOAT_PATTERN.test(str))
            return tagFloat(parseFloat(str.substring(0, str.length - 1)));
        if (MojangsonParser.BYTE_PATTERN.test(str))
            return tagByte(parseInt(str.substring(0, str.length - 1)));
        if (MojangsonParser.LONG_PATTERN.test(str))
            return tagLong(BigInt(str.substring(0, str.length - 1)));
        if (MojangsonParser.SHORT_PATTERN.test(str))
            return tagShort(parseInt(str.substring(0, str.length - 1)));
        if (MojangsonParser.INT_PATTERN.test(str))
            return tagInt(parseInt(str));
        if (MojangsonParser.DOUBLE_PATTERN.test(str))
            return tagDouble(parseFloat(str.substring(0, str.length - 1)));
        if (MojangsonParser.DOUBLE_PATTERN_NOSUFFIX.test(str))
            return tagDouble(parseFloat(str));
        if (str === 'true')
            return tagByte(1);
        if (str === 'false')
            return tagByte(0);
        return tagString(str);
    };

    private readList = (): NBT => {
        if (this.reader.canRead(3) && this.reader.peek(1) !== '"' && this.reader.peek(2) === ';')
            return this.readArrayTag();
        else
            return this.readListTag();
    };

    private readStruct = (): NBT => {
        this.expect('{');
        let compound = tagCompound();
        this.reader.skipWhitespace();
        while (this.reader.canRead() && this.reader.peek() !== '}') {
            let start = this.reader.cursor;
            let key = this.readKey();
            if (key.length <= 0) {
                this.reader.cursor = start;
                throw new Error('Expected key');
            }
            this.expect(':');
            compound.__value__[key] = this.readValue();
            if (!this.hasElementSeparator())
                break;
            if (!this.reader.canRead())
                throw new Error('Expected key');
        }
        this.expect('}');
        return compound;
    };

    private readListTag = (): NBT => {
        this.expect('[');
        this.reader.skipWhitespace();
        if (!this.reader.canRead())
            throw new Error('Expected value');
        let elements = new Array<any>();
        let elementTypeId = 0;
        while (this.reader.peek() !== ']') {
            let start = this.reader.cursor;
            let element = this.readValue();
            if (elementTypeId === 0)
                elementTypeId = element.__typeId__;
            else if (element.__typeId__ !== elementTypeId) {
                this.reader.cursor = start;
                throw new Error(`Can't insert ${element.__typeId__} into list of ${elementTypeId}`);
            }
            elements.push(element);
            if (!this.hasElementSeparator())
                break;
            if (!this.reader.canRead())
                throw new Error('Expected value');
        }
        this.expect(']');
        return tagList(elements);
    };

    private readArrayTag = (): NBT => {
        this.expect('[');
        let start = this.reader.cursor;
        let c = this.reader.read();
        this.reader.read();
        this.reader.skipWhitespace();
        if (!this.reader.canRead())
            throw new Error('Expected value');
        switch (c) {
            case 'B': return tagByteArray(this.readArray(7, 1)); // byte array
            case 'I': return tagIntArray(this.readArray(11, 3)); // int array
            case 'L': return tagLongArray(this.readArray(12, 4)); // long array
            default:
                this.reader.cursor = start;
                throw new Error(`Invalid array type '${c}'`);
        }
    };

    private readArray = (arrayTypeId: number, elementTypeId: number): Array<number> => {
        let array = new Array<number>();
        while (true) {
            if (this.reader.peek() !== ']') {
                let start = this.reader.cursor;
                let value = this.readValue();
                if (value.__typeId__ !== elementTypeId) {
                    this.reader.cursor = start;
                    throw new Error(`Can't insert ${value.__typeId__} into ${arrayTypeId}`);
                }
                array.push(value.__value__);
                if (this.hasElementSeparator()) {
                    if (!this.reader.canRead())
                        throw new Error('Expected value');
                    continue;
                }
            }
            this.expect(']');
            return array;
        }
    };

    private hasElementSeparator = (): boolean => {
        this.reader.skipWhitespace();
        if (this.reader.canRead() && this.reader.peek() === ',') {
            this.reader.skip();
            this.reader.skipWhitespace();
            return true;
        } else {
            return false;
        }
    };

    private expect = (expected: string) => {
        this.reader.skipWhitespace();
        this.reader.expect(expected);
    };
}

export function parseMojangson(mojangson: string): NBT {
    let reader = new StringReader(mojangson);
    let parser = new MojangsonParser(reader);
    return parser.readSingleStruct();
}

export function parseMojangsonValue(mojangson: string): NBT {
    let reader = new StringReader(mojangson);
    let parser = new MojangsonParser(reader);
    return parser.readValue();
}
