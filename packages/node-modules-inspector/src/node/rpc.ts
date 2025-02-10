import type { ListPackageDependenciesOptions, ListPackageDependenciesResult } from 'node-modules-tools'
import type { ServerFunctions } from '../shared/types'
import process from 'node:process'
import { listPackageDependencies } from 'node-modules-tools'
import { CACHE_TTL } from './constants'

export function createServerFunctions(options: Partial<ListPackageDependenciesOptions>): ServerFunctions {
  const cachedDeps: { cacheTime: number, result: ListPackageDependenciesResult | undefined } = {
    result: undefined,
    cacheTime: 0,
  }

  return {
    async listDependencies(force = false) {
      if (force || Date.now() - cachedDeps.cacheTime > CACHE_TTL) {
        console.log('Reading dependencies...')
        const result = await listPackageDependencies({
          cwd: process.cwd(),
          depth: 25,
          monorepo: true,
          ...options,
        })
        cachedDeps.result = result
        cachedDeps.cacheTime = Date.now()
      }

      return cachedDeps.result!
    },
    async openInEditor(filename: string) {
      // @ts-expect-error missing types
      await import('launch-editor').then(r => (r.default || r)(filename))
    },
    async openInFinder(filename: string) {
      await import('open').then(r => r.default(filename))
    },
  }
}
