import { expect } from 'chai'
import {
  NBTTypes
  // tagByte
  // tagShort,
  // tagInt,
  // tagLong,
  // tagFloat,
  // tagDouble,
  // tagByteArray,
  // tagString,
  // tagList,
  // tagCompound,
  // tagIntArray,
  // tagLongArray
} from '../src'

describe('l2nbt.js - nbt.ts unit test', () => {
  describe('NBTType', () => {
    it('basic', () => {
      expect(NBTTypes.TAG_BYTE).to.be.eq(0x1)
    })
  })
})
