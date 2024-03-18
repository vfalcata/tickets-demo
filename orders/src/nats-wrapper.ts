import nats,{Stan} from 'node-nats-streaming';

class NatsWrapper{
    private _client?: Stan; //this tells TS that this field may be undefined for some time

    //called with natsWrapper.client as if it were a field NOT executing a function
    get client(){
        if(!this._client){
            throw new Error('Cannot access NATS client before connecting')
        }
        return this._client
    }

    connect(clusterId:string, clientId:string, url:string){
        this._client = nats.connect(clusterId,clientId,{url})

        //Exit command is done at the index.ts

        //return a promise to allow for await/async syntax for callers
        return new Promise<void>((resolve,reject)=>{
            //TS will assume that the this._client can be possibly unassigned here so it will throw an error
            this.client.on('connect', () => {
                //we use getter for the client so that an error is thrown if it is not connected
                console.log('Connected to NATS')
                resolve();
            });
            this.client.on('error', (err)=>{
                reject();
            })

        })
    }
}

export const natsWrapper = new NatsWrapper()
