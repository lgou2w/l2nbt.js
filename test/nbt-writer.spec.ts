/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import {
  NBTTypes,
  write,
  writeBase64,
  tagCompound,
  tagByte,
  tagShort,
  tagInt,
  tagLong,
  tagFloat,
  tagDouble,
  tagByteArray,
  tagString,
  tagList,
  tagIntArray,
  tagLongArray
} from '../src'

/**
 * Structure:
 *
 * <TAG_COMPOUND> {
 *   foo: <TAG_BYTE> {
 *     [PROPERTY_VALUE]: 1
 *     ...
 *   }
 *   ...
 * }
 *
 * Length = 11
 * Content:
 *    10 : TAG_COMPOUND (byte)
 *   0,0 : UTF Length (short) = two zeros represent an empty string
 *     1 : TAG_BYTE (byte)
 *   0,3 : UTF Length (short) = 'foo'.length, three bytes
 *   102 : ASCII (byte) = f
 *   111 : ASCII (byte) = o
 *   111 : ASCII (byte) = o
 *     1 : Value (byte) = 1
 *     0 : TAG_END (byte) = Only TAG_COMPOUND EOF
 */
const BINARY = new Int8Array([10, 0, 0, 1, 0, 3, 102, 111, 111, 1, 0])
const BASE64 = 'CgAAAQADZm9vAQA='

describe('l2nbt.js - writer', () => {
  describe('write', () => {
    it('basic', () => {
      const tag = tagCompound({ foo: tagByte(1) })
      const binary = write(tag)
      expect(binary instanceof Int8Array).to.be.true
      expect(binary).to.be.lengthOf(BINARY.length)
      expect(binary[0]).to.be.eq(NBTTypes.TAG_COMPOUND)
      expect(binary[3]).to.be.eq(NBTTypes.TAG_BYTE)
    })
  })
  describe('writeBase64', () => {
    it('basic', () => {
      const tag = tagCompound({ foo: tagByte(1) })
      const base64 = writeBase64(tag)
      expect(base64).to.be.a('string')
      expect(base64).to.be.eq(BASE64)
    })
  })
  describe('all tag types', () => {
    // @ts-ignore TODO
    // eslint-disable-next-line no-unused-vars
    const tag = tagCompound({ // 3 bytes: [10, 0, 0]
      b: tagByte(), // 5 bytes: [1, 0, 1, 98, 0]
      s: tagShort(), // 6 bytes: [2, 0, 1, 115, 0, 0]
      i: tagInt(), // 8 bytes: [3, 0, 1, 105, 0, 0, 0, 0]
      l: tagLong(), // 12 bytes: [4, 0, 1, 108, 0, 0, 0, 0, 0, 0, 0, 0]
      f: tagFloat(), // 8 bytes: [5, 0, 1, 102, 0, 0, 0, 0]
      d: tagDouble(), // 12 bytes: [6, 0, 1, 100, 0, 0, 0, 0, 0, 0, 0, 0]
      '[b': tagByteArray(), //  9 bytes: [7, 0, 2, 91, 98, 0, 0, 0, 0]
      '"': tagString(), // 6 bytes: [8, 0, 1, 34, 0, 0]
      '[': tagList(), // 9 bytes: [9, 0, 1, 91, 0, 0, 0, 0, 0]
      '{': tagCompound(), // 5 bytes: [10, 0, 1, 123, 0]
      '[i': tagIntArray(), // 9 bytes: [11, 0, 2, 91, 105, 0, 0, 0, 0]
      '[l': tagLongArray() // 9 bytes: [12, 0, 2, 91, 108, 0, 0, 0, 0]
    }) // 1 bytes: [0]
    it('write binary', () => {
      // const data = write(tag)
      // expect(data.subarray(3, 8)).to.be.eq(new Int8Array([1, 0, 1, 98, 0]))
    })
  })
})
