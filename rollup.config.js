import {uglify} from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import license from 'rollup-plugin-license';

const base = {
  input: "src/l2nbt.ts",
  output: [
    {
      format: "umd",
      name: "l2nbt",
      file: "dist/l2nbt.js",
      indent: "\t"
    },
    {
      format: "es",
      file: "dist/l2nbt.module.js",
      indent: "\t"
    }
  ],
  plugins: [
    resolve(),
    typescript(),
    license({
      banner: `
        Copyright (C) 2019 The lgou2w <lgou2w@hotmail.com>
        
        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        
        http://www.apache.org/licenses/LICENSE-2.0
                 
        Unless required by applicable law or agreed to in writing, software
        distributed under the License is distributed on an "AS IS" BASIS,
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        See the License for the specific language governing permissions and
        imitations under the License.
				`
    })
  ]
};

export default [
  base,
  Object.assign({}, base, {
    output: Object.assign({}, base.output[0], { file: "dist/l2nbt.min.js" }),
    plugins: (() => {
      const plugin = base.plugins.slice();
      plugin.splice(1, 0, uglify());
      return plugin;
    })()
  }),
];
