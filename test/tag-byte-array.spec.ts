/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagByteArray
} from '../src'

describe('l2nbt.js - tagByteArray', () => {
  it('basic', () => {
    const tag = tagByteArray([1])
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_BYTE_ARRAY)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.have.same.members([1])
      .with.lengthOf(1)
  })
})
