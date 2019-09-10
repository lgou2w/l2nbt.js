export type NBTMetadata = { readonly typeId: number, name: string };
export type NBT = {
    [key: string]: any,
    __typeId__: number,
    __value__: any,
    __elementTypeId__?: number,
    __nbt__: boolean
};

export function isNBT(value: any): boolean {
    return typeof value === 'object' && value.__typeId__ && value.__nbt__;
}

export function tag(value: any, typeId: number): NBT {
    return {
        __value__: value,
        __typeId__: typeId,
        __nbt__: true
    }
}
export function tagByte(value: number = 0): NBT { return tag(value, 1) }
export function tagShort(value: number = 0): NBT { return tag(value, 2) }
export function tagInt(value: number = 0): NBT { return tag(value, 3) }
export function tagLong(value: number | string | bigint = 0): NBT {
    if (typeof value !== 'bigint')
        value = BigInt(value);
    return tag(value, 4)
}
export function tagFloat(value: number = 0): NBT { return tag(value, 5) }
export function tagDouble(value: number = 0): NBT { return tag(value, 6) }
export function tagByteArray(value: number[] = []): NBT { return tag(value, 7) }
export function tagString(value: string = ''): NBT { return tag(value, 8) }
export function tagList(value: NBT[] = []): NBT {
    let elementTypeId = 0;
    for (let item of value) {
        if (typeof item !== 'object' || !item.__typeId__ || item.__value__ === undefined)
            throw new Error(`Illegal nbt: ${item}`);
        if (elementTypeId === 0)
            elementTypeId = item.__typeId__;
        else if (item.__typeId__ !== elementTypeId)
            throw new Error(`Illegal element '${item}' type: ${item.__typeId__}. (Expected: ${elementTypeId})`);
    }
    if (elementTypeId === 10)
        return tag(value, 9);
    else {
        // Pure list entry
        let pures = new Array<any>();
        for (let item of value)
            pures.push(item.__value__);
        let nbt = tag(pures, 9);
        nbt.__elementTypeId__ = elementTypeId;
        return nbt;
    }
}
export function tagCompound(value: { [key: string]: NBT } = {}): NBT {
    for (let k in value) {
        let v = value[k];
        if (typeof v !== 'object' || !v.__typeId__ || v.__value__ === undefined)
            throw new Error(`Illegal nbt: key = ${k}, value = ${v}`)
    }
    return tag(value, 10);
}
export function tagIntArray(value: number[] = []): NBT { return tag(value, 11) }
export function tagLongArray(value: number[] | string[] | bigint[] = []): NBT {
    let result = new Array<bigint>();
    for (let item of value) {
        if (typeof item !== 'bigint')
            item = BigInt(item);
        result.push(item);
    }
    return tag(result, 12)
}

export function resolve(nbt: NBT): NBT {
    if (!Object.defineProperty)
        throw new Error("The runtime environment is not support Object.defineProperty feature.");
    if (nbt.__typeId__ === 9) {
        for (let item of nbt.__value__)
            if (item.__typeId__ === 9 || item.__typeId__ === 10)
                resolve(item);
    } else if (nbt.__typeId__ === 10) {
        for (let k in nbt.__value__) {
            let v : NBT = nbt.__value__[k];
            Object.defineProperty(nbt, k, {
                get(): any {
                    return v.__typeId__ === 10 ? v : v.__value__;
                },
                set(value: any): void {
                    let valueType = typeof value;
                    switch (v.__typeId__) {
                        case 1:
                        case 2:
                        case 3:
                        case 5:
                        case 6:
                            if (valueType !== 'number')
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: number)`);
                            v.__value__ = value;
                            break;
                        case 4:
                            if (valueType === 'number' || valueType === 'string')
                                value = BigInt(value);
                            else if (valueType !== 'bigint')
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: number | string | bigint)`);
                            v.__value__ = value;
                            break;
                        case 7:
                        case 11:
                            if (!(value instanceof Array))
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: number Array)`);
                            for (let el of value)
                                if (typeof el !== 'number')
                                    throw new Error(`Illegal value element type: '${typeof el}' (Expected: number)`);
                            v.__value__ = value;
                            break;
                        case 8:
                            if (valueType !== 'string')
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: string)`);
                            v.__value__ = value;
                            break;
                        case 9:
                            if (!(value instanceof Array))
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: NBT Array)`);
                            let list = tagList(value);
                            v.__value__ = list.__value__;
                            break;
                        case 10:
                            if (valueType !== 'object')
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: NBT)`);
                            let compound = tagCompound(value);
                            v.__value__ = compound.__value__;
                            break;
                        case 12:
                            if (!(value instanceof Array))
                                throw new Error(`Illegal key '${k}' value type: '${valueType}' (Expected: number | string | bigint of Array)`);
                            let longArray = tagLongArray(value);
                            v.__value__ = longArray.__value__;
                            break;
                    }
                },
            });
            if (v.__typeId__ === 9 || v.__typeId__ === 10)
                resolve(v);
        }
    }
    return nbt;
}
