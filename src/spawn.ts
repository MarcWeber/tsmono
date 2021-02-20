import { ChildProcess, spawn } from "child_process";
import chalk from "chalk";

const spawn_ = (cmd: string, args: string[], o: {
    title: string,
    echo?:true
}) =>  new Promise((r,j) => {
    const title = o.title || JSON.stringify([cmd, ...args])

    let y: ChildProcess |undefined = undefined
    const p = new Promise((r,j) => {
        let out = ""
        y = spawn(cmd, args, { stdio: [ undefined, 'pipe', 1] })

        y.stdout?.on("data", (s) => { out += s; if (o.echo) console.log(""+s);})
        y.stderr?.on("data", (s) => { out += s; if (o.echo) console.log(""+s);})

        y.on("close", (code, signal) => {
            if (code == 0) r();
            // fs.writeFileSync(`${x}.log`, out)
            console.log(`== ${title} exited with : ${code} `);
            if (!o.echo) console.log(out);
            if (code == 0)
                console.log(chalk.green(`${title} exited gracefully`));
            else
                console.log(chalk.red(`${title} exited with code ${code}`));
            j(`code ${code}`)
        })
    });
    return {
        p,
        kill: () => y?.kill()
    }
})

export default spawn_
