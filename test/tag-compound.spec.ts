/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagByte,
  tagLong,
  tagString,
  tagCompound
} from '../src'

describe('l2nbt.js - tagCompound', () => {
  it('basic', () => {
    const tag = tagCompound()
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_COMPOUND)
    expect(tag)
      .to.have.property(P_VALUE)
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
