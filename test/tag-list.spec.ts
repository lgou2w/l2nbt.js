/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagList
} from '../src'

describe('l2nbt.js - tagList', () => {
  it('basic', () => {
    const tag = tagList()
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_LIST)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.is.empty
  })
})
