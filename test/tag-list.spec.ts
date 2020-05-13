/* eslint-disable no-unused-expressions */
// @ts-nocheck

import { expect } from 'chai'
import { P_TYPE, P_VALUE } from './constants'
import {
  NBTTypes,
  tagList,
  tagByte,
  tagInt
} from '../src'

describe('l2nbt.js - tagList', () => {
  it('basic', () => {
    const tag = tagList()
    expect(tag).to.have.property(P_TYPE, NBTTypes.TAG_LIST)
    expect(tag)
      .to.have.property(P_VALUE)
      .that.is.empty
  })
  it('illegal value then throw error', () => {
    expect(() => tagList(null)).to.throw(Error)
    expect(() => tagList('')).to.throw(Error)
  })
  it('if any element is not tag should throw error', () => {
    expect(() => tagList([tagByte(1), 2, 3]))
      .to.throw(Error)
  })
  it('if element has multiple tag types should throw error', () => {
    expect(() => tagList([tagByte(1), tagInt(2), tagByte(3)]))
      .to.throw(Error)
  })
})
