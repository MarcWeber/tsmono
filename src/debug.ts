// copy from utils-debug
// @ts-ignore
export const debug: string[] = (process.env['DEBUG']||"").split(':').filter((x) => x != "")
const do_debug_help = debug.length > 0 && ! debug.includes('hide-help')
export const debug_help = (msg:string) => { if (do_debug_help) console.log(msg) }

debug_help("env DEBUG found")
debug_help("export DEBUG='no-help' to avoid this message")
debug_help("export DEBUG='moduleA:moduleB' to show debug messages of moduleA and moduleB")
debug_help("export DEBUG='true:-moduleA' to show debug messages except those of moduleA")
debug_help("Watch for lines starting with debug-list:  to find all loaded modules you focus on or block")

export default (module:string):
    ((...args: any[]) => void) & {log: boolean} => {
    if (do_debug_help)
        console.log("debug-list:", module)

    const log = debug.includes(module) || (debug.includes('true') && !debug.includes(`-${module}`))

    const fun = log
    ?  (...args: any[]) => { 
        // TODO: use stderr
        console.log("DEBUG:", module, ...args);
    }
    : () => {}

    // @ts-ignore
    fun.log = log; return fun
}
