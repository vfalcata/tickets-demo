export const natsWrapper ={
    client:{
        //called by new.ts and update.ts
        //jest.fn() is how we make mock functions that can be called from anything inside our appliction
        //internally this will keep track of when this function is called, arguments passed so we can make expectations around them
        publish: jest.fn().mockImplementation((subject:string, data:string, callback:()=>void)=>{
            callback();
        })
        //recall that in our natsWrapper, the callback function must be invoked to signal success
        //so we want to both have the jest mock functionalities and some implementation
        //the function inside mockImplementation will be invoked when publish is called
        //we also want to reset this for each new test, so that the data stored is fresh
        //we do this in the test/setup.ts with jest.clearAllMocks();
    }
};

