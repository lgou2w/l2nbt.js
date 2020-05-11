/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { PROPERTY_TYPE, PROPERTY_VALUE } from './constants'
import { NBTTypes, read, readBase64 } from '../src'

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

describe('l2nbt.js - nbt-reader.ts unit test', () => {
  describe('0x1 - read', () => {
    it('basic', () => {
      const tag = read(BINARY)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_COMPOUND)
      expect(tag[PROPERTY_VALUE])
        .to.have.property('foo')
        .that.have.property(PROPERTY_VALUE)
        .with.eq(1)
    })
  })
  describe('0x2 - readBase64', () => {
    it('basic', () => {
      const tag = readBase64(BASE64)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_COMPOUND)
      expect(tag[PROPERTY_VALUE])
        .to.have.property('foo')
        .that.have.property(PROPERTY_VALUE)
        .with.eq(1)
    })
  })
})
