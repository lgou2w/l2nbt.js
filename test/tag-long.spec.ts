/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagLong
} from '../src'

describe('l2nbt.js - tagLong', () => {
  it('basic', () => {
    const tag = tagLong(1)
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_LONG)
    expect(tag).to.have.property(P_VALUE).to.be.eq(BigInt(1))
  })
  it('empty value or undefined, the value is 0', () => {
    expect(tagLong())
      .to.have.property(P_VALUE)
      .that.is.eq(BigInt(0))
    expect(tagLong(undefined))
      .to.have.property(P_VALUE)
      .that.is.eq(BigInt(0))
  })
  it('illegal value then throw error', () => {
    expect(() => tagLong(null)).to.throw(Error)
    expect(() => tagLong([])).to.throw(Error)
  })
})
