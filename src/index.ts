#!/usr/bin/env node

import { unlink } from 'fs/promises'
import { join } from 'path'
import files from '@unvented/files'
import minimist from 'minimist'

(async () => {
  const argv = minimist(process.argv.slice(2))

  for (let directory of argv._) {
    directory = join(process.cwd(), directory.startsWith('./') ? directory : `./${directory}`)

    for await (const file of files(directory))
      await unlink(file)
  }
})()
