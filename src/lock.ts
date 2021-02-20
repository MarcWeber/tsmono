// usage
// const bathroom_lock = something_to_be_locked({preventExit:true})

// const release = await bathroom_lock['aquire_lock']()
// do stuff
// release()


// this is not code. It just is a typing information for the compiler
export type ReleaseLock = () => void
export type AquireLock =  () => Promise<ReleaseLock>

// this is not used, beacuse the typing something_to_be_locked has typing attached
export type TypeOfsomething_to_be_locked = (o: {preventExit?: boolean}) => { 'aquire_lock' : AquireLock}


export const createLock = ({preventExit}      :{ preventExit?: boolean }): {
                                       /* this is code*/  /* ^ this is hinting  of first arg, then after : the return type of the function*/
    aquire_lock: AquireLock

} => {
    let locked = false;
    const waiting_list: any[] = []

    let preventExitInterval: number | undefined;

    const next = () => {
        const n = waiting_list.shift()
        if (n) n(next);
        else {
            locked = false;
            clearInterval(preventExitInterval)
        }
    }

    if (preventExit && !preventExitInterval){
        preventExitInterval = <any>setInterval(() => {}, 100000) // prevent node from exitng by periodically running this once every 100 seconds
    }

    // instead of returning the function
    // we return a dicitoanry with a key 'aquire_lock'
    // now so that the usage is more descriptivie
    return {
        'aquire_lock': () => {
            let resolve: (x:any) => void
            // promise which will resolve once the thing is free
            let p: Promise<ReleaseLock> = new Promise((r, j) => {
                resolve = r;
            })
            if (locked) {
                // @ts-ignore
                waiting_list.push(resolve)
            } else {
                locked = true;
                // @ts-ignore
                resolve(next)
            }
            return p;
        }
    }
}
