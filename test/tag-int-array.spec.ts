/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagIntArray
} from '../src'

describe('l2nbt.js - tagIntArray', () => {
  it('basic', () => {
    const tag = tagIntArray([1])
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_INT_ARRAY)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.have.same.members([1])
      .with.lengthOf(1)
  })
})
