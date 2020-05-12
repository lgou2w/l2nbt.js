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
    const tag = tagLongArray([1])
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_LONG_ARRAY)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.have.same.members([BigInt(1)])
      .with.lengthOf(1)
  })
})
