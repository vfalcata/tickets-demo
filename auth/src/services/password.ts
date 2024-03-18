import { scrypt, randomBytes } from 'crypto'; //callback based, and we want to use async and await
import { promisify } from 'util'; //takes callback based functions and turns them into promise based implementation

const scryptAsync = promisify(scrypt) //now we can call scryptAsync to use the promise version and thus async/await syntax

export class Password{
    static async toHash(password: string){
        const salt = randomBytes(8).toString('hex');

        //hash the password along with the salt
        const buf = (await scryptAsync(password,salt,64)) as Buffer; //explicit casting telling buf is a Buffer so read it as such
        //last argument is keylength, in this case 64
        return `${buf.toString('hex')}.${salt}`
    }
    static async compare(storedPassword: string, suppliedPassword: string){
        const [hashedPassword, salt] = storedPassword.split('.');
        const buf = (await scryptAsync(suppliedPassword,salt,64)) as Buffer;
        return buf.toString('hex') === hashedPassword
    }
}