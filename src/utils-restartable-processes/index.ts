import { spawn as spawn_, SpawnOptions, ChildProcessWithoutNullStreams, ChildProcess } from "child_process";
import chalk from "chalk";
import path from "path";
import fs from "fs";


export type CompileAndStartOpts = {
    outdir: string,
    ts_file: string
}

export const restartable_processes = () => {

    const processes: {[key:string]: ChildProcess} = {}

    const spawn = (key_and_name: string, cmd: string, args: string[], echo?:true) =>  new Promise((r,j) => {
        let out = ""
        if (processes[key_and_name])  { console.log('killing'); processes[key_and_name].kill() }
        const y = spawn_(cmd, args, { stdio: [ undefined, 'pipe', 1] })
        console.log(`== ${key_and_name} spawned`);
        processes[key_and_name] = y

        y.stdout?.on("data", (s) => { out += s; if (echo) console.log(""+s);})
        y.stderr?.on("data", (s) => { out += s; if (echo) console.log(""+s);})

        processes[key_and_name].on("close", (code, signal) => {
            if (code == 0) r(undefined);
            fs.writeFileSync(`${key_and_name}.log`, out)
            console.log(`== ${key_and_name} exited with : ${code} `);
            if (!echo) console.log(out);
            if (code == 0)
                console.log(chalk.green(`${key_and_name} exited gracefully`));
            else
                console.log(chalk.red(`${key_and_name} exited with code ${code}`));
            j(`code ${code}`)
            delete processes[key_and_name]
        })
    })


    const kill_all = () => {
        for (let [k, v] of Object.entries(processes)) {
            console.log(chalk.red(`killing ${k}`));
            try { v.kill(); } catch (e){ }
        }
    }

    return {
        spawn,
        kill_all
    }
}
