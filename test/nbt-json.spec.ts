/* eslint-disable no-unused-expressions */

import { expect } from 'chai'
import {
  tagByte,
  tagString,
  tagCompound,
  writeMojangson
} from '../src'

describe('l2nbt.js - mojangson', () => {
  describe('write', () => {
    it('basic', () => {
      const tag = tagCompound({
        foo: tagByte(1),
        bar: tagString('"HelloWorld"')
      })
      const mojangson = writeMojangson(tag)
      expect(mojangson).to.be.eq('{"foo":1b,"bar":"\\"HelloWorld\\""}')
    })
  })
})
