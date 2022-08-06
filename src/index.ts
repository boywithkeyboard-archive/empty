#!/usr/bin/env node

import { lstat, mkdir, readdir, rmdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import files from '@unvented/files'
import minimist from 'minimist'

(async () => {
  const argv = minimist(process.argv.slice(2))

  const stats = async (path: string) => {
    try {
      return await stat(path)
    } catch (err) {
      return undefined
    }
  }
  
  const removeEmptyDirectories = async (directory: string) => {
    const stats = await lstat(directory)

    if (!stats.isDirectory()) return

    let fileNames = await readdir(directory)

    if (fileNames.length > 0) {
      const recursiveRemovalPromises = fileNames.map(
        fileName => removeEmptyDirectories(join(directory, fileName))
      )

      await Promise.all(recursiveRemovalPromises)

      fileNames = await readdir(directory)
    }

    if (fileNames.length === 0)
      await rmdir(directory)
  }

  for (let directory of argv._) {
    directory = join(process.cwd(), directory.startsWith('./') || directory.startsWith('../') ? directory : `./${directory}`)

    if (!(await stats(directory))?.isDirectory()) {
      await mkdir(directory, {
        recursive: true
      })
    } else {
      for await (const file of files(directory))
        await unlink(file)

      await removeEmptyDirectories(directory)
      await mkdir(directory)
    }
  }
})()
