/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagLongArray
} from '../src'

describe('l2nbt.js - tagLongArray', () => {
  it('basic', () => {
    const tag = tagLongArray([1, '2', BigInt(3)])
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_LONG_ARRAY)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.have.same.members([BigInt(1), BigInt(2), BigInt(3)])
      .with.lengthOf(3)
  })
  it('empty value or undefined, the value is empty array', () => {
    expect(tagLongArray())
      .to.have.property(P_VALUE)
      .that.is.empty
    expect(tagLongArray(undefined))
      .to.have.property(P_VALUE)
      .that.is.empty
  })
  it('illegal value then throw error', () => {
    expect(() => tagLongArray(null)).to.throw(Error)
    expect(() => tagLongArray([null])).to.throw(Error)
  })
})
