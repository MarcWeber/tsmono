import * as fs from "fs-extra";
import path from "path";
import { JSONFile } from "./jsonfile";
import { Repository } from ".";

export type Paths = Record< string, string[]>
export type Links = Record< string, string>

export type TsmonoConfig = {
    directories: string
}

export interface RemoteLocation {
    server: string,
    "repositories-path-bare": string,  // where to push to  (remote basename eg repos will be put into bare-repositories/<NAME>
    "repositories-path-checked-out": string,      // where to keep checked out versiorn if you choose --care-about-remote-checkout)
    gitRemoteLocationName: string, // .git/config
    ignoreWhenPulling?: string[]
    ignoreWhenPushing?: string[]
}


interface Cache {

  get: <T>(key: string,  f: () => T, ttl_seconds?: number) => T;

  get_async: <T>(key: string, f: () => Promise<T>, ttl_seconds?: number) => Promise<T>;
}

export class DirectoryCache implements Cache {
  // sry for reimplementing it - need a *simple* fast solution
  constructor(public path: string) {
  }

  public get<T>(key: string, f: () => T, ttl_seconds?: number ): T {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined) {
      const r = f();
      this.put_(key, r)
      return r
    }
    return cached
  }

  public async get_async<T>(key: string,  f: () => Promise<T>, ttl_seconds?: number): Promise<T> {
    const cached = this.get_(key, ttl_seconds);
    if (cached === undefined) {
      const r = await f();
      this.put_(key, r)
      return r
    }
    return cached
  }

  private tc_() {
    return new Date().getTime()
  }

  private path_(key: string) {
    return path.join(this.path, btoa(key));
  }

  private get_(key: string, ttl: number|undefined) {
    const p = this.path_(key)
    if (fs.existsSync(p)) {
      const json = JSON.parse(fs.readFileSync(p, "utf8"))
      if (ttl === undefined || !(this.tc_() - json.tc > ttl))
        return json.thing;
    }
    return undefined
  }

  private put_(key: string, thing: any) {
    if (!fs.existsSync(this.path)) fs.mkdirpSync(this.path)
    fs.writeFileSync(this.path_(key), JSON.stringify({thing, tc: this.tc_()}));
  }
}

export type ConfigData = {
  cache: DirectoryCache,
  fetch_ttl_seconds: number,
  npm_install_cmd: string[], // eg ['fyn'] or ['npm', 'i']
  bin_sh: string,

  directories?: string[] // 

  "remote-location": RemoteLocation
}

export const cfg_api = (cfg: ConfigData) => {

  const fetch_from_registry = (name: string): Promise<any> => {
    return cfg.cache.get_async(`fetch-${name}-registry.npmjs.org`, async () => {
      // TODO add cache
      const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`
      const res = await fetch(url)
      if (res.status !== 200)
        throw new Error(`fetching ${url}`)
        // returns {"error":"not found"} if package doesn't exist
      return res.json()
    }, cfg.fetch_ttl_seconds)
  }

  const npm_version_for_name = async (name: string): Promise<string|undefined> => {
    const lock = new JSONFile(".tsmonolock")
    if (!(name in lock.json)) {
      const r = await fetch_from_registry(name)
      if (r.error) return undefined
      lock.json[name] = `^${r["dist-tags"].latest}`
      lock.flush()
    }
    return lock.json[name]
  }

  return {
    fetch_from_registry,
    npm_version_for_name,
  }
}

export type Config = ConfigData & ReturnType<typeof cfg_api>

export type CP = { cfg: Config, p: Repository }
