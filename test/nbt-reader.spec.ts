/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import { NBTTypes, read, readBase64, NBTCompound } from '../src'

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

// See: nbt-writer.spec.ts Line 68
const BINARY_ALL = new Int8Array([
  10, 0, 0, 1, 0, 1, 98, 0, 2, 0, 1, 115, 0, 0, 3, 0, 1, 105, 0, 0, 0,
  0, 4, 0, 1, 108, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1, 102, 0, 0, 0, 0, 6,
  0, 1, 100, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 2, 91, 98, 0, 0, 0, 0, 8, 0,
  1, 34, 0, 0, 9, 0, 1, 91, 0, 0, 0, 0, 0, 10, 0, 1, 123, 0, 11, 0, 2,
  91, 105, 0, 0, 0, 0, 12, 0, 2, 91, 108, 0, 0, 0, 0, 0
])

describe('l2nbt.js - reader', () => {
  describe('read', () => {
    it('basic', () => {
      const tag = read(BINARY)
      expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_COMPOUND)
      expect(tag[P_VALUE])
        .to.have.property('foo')
        .that.have.property(P_VALUE)
        .with.eq(1)
    })
  })
  describe('readBase64', () => {
    it('basic', () => {
      const tag = readBase64(BASE64)
      expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_COMPOUND)
      expect(tag[P_VALUE])
        .to.have.property('foo')
        .that.have.property(P_VALUE)
        .with.eq(1)
    })
  })
  describe('all tag types', () => {
    it('read binary', () => {
      const tag = read(BINARY_ALL) as NBTCompound
      expect(tag.b).to.be.eq(0)
    })
  })
})
