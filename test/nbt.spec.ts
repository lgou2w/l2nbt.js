/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { PROPERTY_TYPE, PROPERTY_VALUE } from './constants'
import {
  NBTTypes,
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
  tagLongArray
} from '../src'

describe('l2nbt.js - nbt.ts unit test', () => {
  describe('0x1 - tagByte', () => {
    it('basic', () => {
      const tag = tagByte(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_BYTE)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(1)
    })
  })
  describe('0x2 - tagShort', () => {
    it('basic', () => {
      const tag = tagShort(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_SHORT)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(1)
    })
  })
  describe('0x3 - tagInt', () => {
    it('basic', () => {
      const tag = tagInt(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_INT)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(1)
    })
  })
  describe('0x4 - tagLong', () => {
    it('basic', () => {
      const tag = tagLong(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_LONG)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(BigInt(1))
    })
  })
  describe('0x5 - tagFloat', () => {
    it('basic', () => {
      const tag = tagFloat(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_FLOAT)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(1)
    })
  })
  describe('0x6 - tagDouble', () => {
    it('basic', () => {
      const tag = tagDouble(1)
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_DOUBLE)
      expect(tag).to.have.property(PROPERTY_VALUE).to.be.eq(1)
    })
  })
  describe('0x7 - tagByteArray', () => {
    it('basic', () => {
      const tag = tagByteArray([1])
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_BYTE_ARRAY)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .that.have.same.members([1])
        .with.lengthOf(1)
    })
  })
  describe('0x8 - tagString', () => {
    it('basic', () => {
      const tag = tagString('1')
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_STRING)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .to.be.eq('1')
    })
  })
  describe('0x9 - tagList', () => {
    it('basic', () => {
      const tag = tagList()
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_LIST)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .that.is.empty
    })
  })
  describe('0xA - tagCompound', () => {
    it('basic', () => {
      const tag = tagCompound()
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_COMPOUND)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .that.is.empty
    })
    it('nested compound', () => {
      const tag = tagCompound({
        foo: tagByte(1),
        bar: tagLong(2),
        display: tagCompound({
          name: tagString('HelloWorld')
        })
      })
      expect(tag).to.have.property('foo').that.is.eq(1)
      expect(tag).to.have.property('bar').that.is.eq(BigInt(2))
      expect(tag)
        .to.have.property('display')
        .that.have.property('name')
        .that.is.eq('HelloWorld')
    })
  })
  describe('0xB - tagIntArray', () => {
    it('basic', () => {
      const tag = tagIntArray([1])
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_INT_ARRAY)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .that.have.same.members([1])
        .with.lengthOf(1)
    })
  })
  describe('0xC - tagLongArray', () => {
    it('basic', () => {
      const tag = tagLongArray([1])
      expect(tag).to.have.property(PROPERTY_TYPE, NBTTypes.TAG_LONG_ARRAY)
      expect(tag)
        .to.have.property(PROPERTY_VALUE)
        .that.have.same.members([BigInt(1)])
        .with.lengthOf(1)
    })
  })
})
