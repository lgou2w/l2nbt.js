/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import {
  NBTTypes,
  write,
  writeBase64,
  tagCompound, tagByte
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
})
