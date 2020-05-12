/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import { NBTTypes } from '../src'

describe('l2nbt.js - types', () => {
  it('basic', () => {
    expect(NBTTypes).to.be.a('object')
  })
})
