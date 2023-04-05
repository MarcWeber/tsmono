import * as fs from "fs-extra";
import deepequal from "deep-equal"
import * as JSON5 from "json5";

export const parse_json_file = (path: string) => {
    try {
        return JSON5.parse(fs.readFileSync(path, 'utf8'))
    } catch (e){
        throw `bad JSON at file ${path}, error: ${e}`
    }
}

export const protect = (path: string, flush: () => void, force: boolean= false, protect_path: string = `${path}.protect`) => {
    if (fs.existsSync(protect_path) && fs.existsSync(path)) {
      if (!force && fs.readFileSync(protect_path, "utf8") !== fs.readFileSync(path, "utf8"))
        // TODO nicer diff or allow applying changes to tsmono.json
        throw new Error(`mv ${protect_path} ${path} to continue. Not overwriting your changes. Use --force to force`)
    }
    flush()
    fs.copyFileSync(path, protect_path)
}

export class JSONFile {
  public json: any = {};

  private json_on_disc: object|undefined = undefined;

  constructor(public path: string, default_: () => object = () => ({})) {
    if (fs.existsSync(this.path)) {
      const s = fs.readFileSync(this.path, "utf8")
      this.json          = parse_json_file(this.path)
    } else {
      this.json_on_disc  = undefined
      this.json = default_()
    }
  }

  public exists(): boolean {
    return fs.existsSync(this.path)
  }

  public flush() {
    const s = JSON.stringify(this.json, undefined, 2)
    if (!deepequal(this.json_on_disc, this.json)) {
      fs.writeFileSync(this.path, s, "utf8")
    }
  }

  public flush_protect_user_changes(force: boolean = false) {
    protect(this.path, () => { this.flush(); }, force)
  }
}
