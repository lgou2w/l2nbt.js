/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagString
} from '../src'

describe('l2nbt.js - tagString', () => {
  it('basic', () => {
    const tag = tagString('1')
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_STRING)
    expect(tag)
      .to.have.property(P_VALUE)
      .to.be.eq('1')
  })
})
