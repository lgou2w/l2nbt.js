/// NBT Types

export type NBTType =
  0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 |
  0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC

export const NBTTypes = {
  TAG_END: 0x0 as NBTType,
  TAG_BYTE: 0x1 as NBTType,
  TAG_SHORT: 0x2 as NBTType,
  TAG_INT: 0x3 as NBTType,
  TAG_LONG: 0x4 as NBTType,
  TAG_FLOAT: 0x5 as NBTType,
  TAG_DOUBLE: 0x6 as NBTType,
  TAG_BYTE_ARRAY: 0x7 as NBTType,
  TAG_STRING: 0x8 as NBTType,
  TAG_LIST: 0x9 as NBTType,
  TAG_COMPOUND: 0xA as NBTType,
  TAG_INT_ARRAY: 0xB as NBTType,
  TAG_LONG_ARRAY: 0xC as NBTType
}

/// NBT

export type NBT = {
  __value__: any
  readonly __type__: NBTType
  readonly __nbt__: true
}

export type NBTList = NBT & {
  readonly __elementType__?: NBTType
}

export type NBTCompound = NBT & {
  [key: string]: NBT
}

export type NBTMetadata = {
  readonly type: NBTType
  readonly name: string
}

export function isNBT (obj: any): obj is NBT {
  return typeof obj === 'object' &&
    obj.__type__ >= NBTTypes.TAG_END &&
    obj.__type__ <= NBTTypes.TAG_LONG_ARRAY &&
    typeof obj.__value__ !== 'undefined' &&
    typeof obj.__nbt__ === 'boolean' &&
    obj.__nbt__
}

/// NBT Tags

export function tag (type: NBTType, value: any): NBT {
  return Object.defineProperties({}, {
    __value__: {
      value,
      writable: true,
      configurable: true,
      enumerable: false
    },
    __type__: {
      value: type,
      writable: false,
      configurable: false,
      enumerable: false
    },
    __nbt__: {
      value: true,
      writable: false,
      configurable: false,
      enumerable: false
    }
  }) as NBT
}

export function tagByte (value?: number): NBT {
  return tag(NBTTypes.TAG_BYTE, value || 0)
}

export function tagShort (value?: number): NBT {
  return tag(NBTTypes.TAG_SHORT, value || 0)
}

export function tagInt (value?: number): NBT {
  return tag(NBTTypes.TAG_INT, value || 0)
}

export function tagLong (value?: number | string | bigint): NBT {
  if (typeof value !== 'bigint') {
    value = BigInt(value || 0)
  }
  return tag(NBTTypes.TAG_LONG, value)
}

export function tagFloat (value?: number): NBT {
  return tag(NBTTypes.TAG_FLOAT, value || 0)
}

export function tagDouble (value?: number): NBT {
  return tag(NBTTypes.TAG_DOUBLE, value || 0)
}

export function tagByteArray (value?: number[]): NBT {
  return tag(NBTTypes.TAG_BYTE_ARRAY, value || [])
}

export function tagString (value?: string): NBT {
  return tag(NBTTypes.TAG_STRING, value || '')
}

export function tagList (value?: NBT[]): NBTList {
  value = value || []
  let elementType: NBTType = NBTTypes.TAG_END
  for (const el of value) {
    if (!isNBT(el)) {
      throw new Error(`NBTList elements must be of type NBT: ${el}`)
    }
    if (elementType === NBTTypes.TAG_END) {
      elementType = el.__type__
    } else if (el.__type__ !== elementType) {
      throw new Error(`Invalid element '${el}' type: ${el.__type__}. (Expected: ${elementType})`)
    }
  }
  if (elementType === NBTTypes.TAG_COMPOUND) {
    const nbt = tag(NBTTypes.TAG_LIST, value)
    return resolve(nbt)
  } else {
    // Defined pure list elements
    const result: any[] = []
    for (const el of value) {
      result.push(el.__value__)
    }
    const nbt = tag(NBTTypes.TAG_LIST, result)
    return Object.defineProperties(nbt, {
      __elementType__: {
        value: elementType,
        writable: false,
        configurable: false,
        enumerable: false
      }
    })
  }
}

export function tagCompound (
  value?: { [key: string]: NBT },
  deleteNotNBT?: boolean
): NBTCompound {
  value = value || {}
  for (const key in value) {
    const val = value[key]
    if (!isNBT(val)) {
      if (deleteNotNBT === true) {
        delete value[key]
      } else {
        throw new Error(`Invalid compound entry: key = ${key}, value = ${val}`)
      }
    }
  }
  const nbt = tag(NBTTypes.TAG_COMPOUND, value)
  return resolve(nbt) as NBTCompound
}

export function tagIntArray (value?: number[]): NBT {
  return tag(NBTTypes.TAG_INT_ARRAY, value || [])
}

export function tagLongArray (value?: (number | string | bigint)[]): NBT {
  const result: bigint[] = []
  for (let el of value || []) {
    if (typeof el !== 'bigint') {
      el = BigInt(el || 0)
    }
    result.push(el)
  }
  return tag(NBTTypes.TAG_LONG_ARRAY, result)
}

function resolve (nbt: NBT): NBT {
  if (nbt.__type__ === NBTTypes.TAG_LIST) {
    for (const el of nbt.__value__) {
      if (el.__type__ === NBTTypes.TAG_LIST ||
        el.__type__ === NBTTypes.TAG_COMPOUND) {
        resolve(el)
      }
    }
  } else if (nbt.__type__ === NBTTypes.TAG_COMPOUND) {
    for (const key in nbt.__value__) {
      const val = nbt.__value__[key] as NBT
      Object.defineProperty(nbt, key, {
        get (): any {
          return val.__type__ === NBTTypes.TAG_COMPOUND
            ? val
            : val.__value__
        },
        set (newVal: any) {
          const typeOf = typeof newVal
          switch (val.__type__) {
            case NBTTypes.TAG_BYTE:
            case NBTTypes.TAG_SHORT:
            case NBTTypes.TAG_INT:
            case NBTTypes.TAG_FLOAT:
            case NBTTypes.TAG_DOUBLE:
              if (typeOf !== 'number') {
                throw new Error(`Invalid key '${key}' value type: ${typeOf}. (Expected: number)`)
              }
              val.__value__ = newVal
              break
            case NBTTypes.TAG_LONG:
              if (typeOf === 'number' || typeOf === 'string') {
                newVal = BigInt(newVal)
              } else if (typeOf !== 'bigint') {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: number | string | bigint)`)
              }
              val.__value__ = newVal
              break
            case NBTTypes.TAG_BYTE_ARRAY:
            case NBTTypes.TAG_INT_ARRAY:
              if (!(newVal instanceof Array)) {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: number Array)`)
              }
              for (const el of newVal) {
                if (typeof el !== 'number') {
                  throw new Error(`Invalid value element type: '${typeof el}' (Expected: number)`)
                }
              }
              val.__value__ = newVal
              break
            case NBTTypes.TAG_STRING:
              if (typeOf !== 'string') {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: string)`)
              }
              val.__value__ = newVal
              break
            case NBTTypes.TAG_LIST:
              if (!(newVal instanceof Array)) {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: NBT Array)`)
              }
              val.__value__ = tagList(newVal).__value__
              break
            case NBTTypes.TAG_COMPOUND:
              if (typeOf !== 'object') {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: NBT)`)
              }
              val.__value__ = tagCompound(newVal).__value__
              break
            case NBTTypes.TAG_LONG_ARRAY:
              if (!(newVal instanceof Array)) {
                throw new Error(`Invalid key '${key}' value type: '${typeOf}' (Expected: (number | string | bigint) of Array)`)
              }
              val.__value__ = tagLongArray(newVal).__value__
              break
          }
        }
      })
      if (val.__type__ === NBTTypes.TAG_LIST ||
        val.__type__ === NBTTypes.TAG_COMPOUND) {
        resolve(val)
      }
    }
  }
  return nbt
}
