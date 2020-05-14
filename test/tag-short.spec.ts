/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagShort
} from '../src'

describe('l2nbt.js - tagShort', () => {
  it('basic', () => {
    const tag = tagShort(1)
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_SHORT)
    expect(tag).to.have.property(P_VALUE).to.be.eq(1)
  })
})
