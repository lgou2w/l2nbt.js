export type NBT = { value: any, readonly typeId: number };
export type NBTMetadata = { readonly typeId: number, name: string };

export function tag(value: any, typeId: number): NBT { return { value, typeId } }
export function tagByte(value: number): NBT { return tag(value, 1) }
export function tagShort(value: number): NBT { return tag(value, 2) }
export function tagInt(value: number): NBT { return tag(value, 3) }
export function tagLong(value: number | string | bigint): NBT {
    if (typeof value !== 'bigint')
        value = BigInt(value);
    return tag(value, 4)
}
export function tagFloat(value: number): NBT { return tag(value, 5) }
export function tagDouble(value: number): NBT { return tag(value, 6) }
export function tagByteArray(value: number[]): NBT { return tag(value, 7) }
export function tagString(value: string): NBT { return tag(value, 8) }
export function tagList(value: NBT[]): NBT {
    let elementTypeId = 0;
    for (let item of value) {
        if (typeof item !== 'object' || !item.value || !item.typeId)
            throw new Error(`Illegal nbt: ${item}`);
        if (elementTypeId === 0)
            elementTypeId = item.typeId;
        else if (item.typeId !== elementTypeId)
            throw new Error(`Illegal element '${item}' type: ${item.typeId}. (Expected: ${elementTypeId})`)
    }
    return tag(value, 9)
}
export function tagCompound(value: { [key: string]: NBT }): NBT {
    for (let k in value) {
        let v = value[k];
        if (typeof v !== 'object' || !v.value || !v.typeId)
            throw new Error(`Illegal nbt: key = ${k}, value = ${v}`)
    }
    return tag(value, 10)
}
export function tagIntArray(value: number[]): NBT { return tag(value, 11) }
export function tagLongArray(value: number[] | string[] | bigint[]): NBT {
    let result = new Array<bigint>();
    for (let item of value) {
        if (typeof item !== 'bigint')
            item = BigInt(item);
        result.push(item);
    }
    return tag(result, 12)
}
