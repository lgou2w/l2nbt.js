import { NBT, tag } from './nbt'

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
    let length = Object.keys(nbt.__value__).length; // compatibility?
    let i = 0;
    for (let k in nbt.__value__) {
        let v : NBT = nbt.__value__[k];
        if (i >= 1 && i < length)
            json.push(',');
        json.push(`\"${k}\":`); // -> "KEY":
        toJsonValue(json, v);
        i++;
    }
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

export function parseMojangson(mojangson: string): NBT {
    throw new Error('TODO');
}
