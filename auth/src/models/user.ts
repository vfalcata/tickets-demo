import mongoose from 'mongoose';
import {Password} from "../services/password";

//To use Mongoose with TS, we need to describe 3 interfaces, one for the attributes required to create a new object,
// one for describing the properties that the Model has
//One for describing the properties that a User Document has

//An interface that describes the properties required to create a new user
interface UserAttrs{ //Attrs is short for attributes
    email: string;
    password: string;
}

//An interface that describes the properties that a User Model has
//we want to take all the properties that already exists on this interface and we
//want to add them in to this new one that we are creating
//this will then allow you to use the extended mongoose model to build new users
interface UserModel extends mongoose.Model<UserDoc>{ //the generic defines the return type of a document
    build(attrs: UserAttrs): UserDoc;
}

//An interface that describes the properties that a user document has
interface UserDoc extends mongoose.Document{
    //a UserDoc has all the properties of mongoose.Document including these ones
    //we also list the properties of UserAttrs and any additional created ones
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema<UserDoc,UserModel>({
    email:{
        type: String, //THIS TYPE IS NOT RELATED TO TS, IT IS ONLY FOR MONGOOSE
        required: true
    },
    password:{
        type: String,
        required: true
    }
},{
    //we use this option to format the json we get back, so that it is consistent throughout our entire microservice
    //this is view level logic and it works for now but ideally should not be here
    toJSON:{
        transform(doc, ret){
            //doc is the original document with its properties
            //ret is the returned modified object
            delete ret.password;
            delete ret.__v;
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

//pre save middle ware to hash and salt password
//this is a middleware function provided by mongoose
userSchema.pre('save',async function (done){
    //mongoose has poor support for await async syntax, so we have to call done
    //using function instead of arrow syntax gives us access to 'this' keyword which is the document we are trying to save

    //we need this function to ensure that we are not hashing an already hashed password
    //we ONLY want to hash the password when it has been modified
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password',hashed)
    }
    done();
})

//this is how we get a custom function built in to a model, we add it to this static's property on our schema
//but typescript does not understand what it means to assign a property to a static's object
//TS needs a little more information we need another interface to tell TS that there's
// going to be a build function available on this user model
userSchema.statics.build = (attrs: UserAttrs)=>{
    return new User(attrs);
}

//First generic argument is the return type of the document, the second is the type of the model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);


//this function will replace all functional calls of 'new User' from mongoose. We will rely on this function to
//create the new user so that we can levarage TS ability to type check. But now we always have to remeber to export it.
//so we can express it differently so it is more convenient to use. We want to include the function with our User model
/* moved to userSchema.statics.build
const buildUser = (attrs: UserAttrs) =>{
 return new User(attrs); //mongoose is used internally here to create a new user
}
*/

// User.build({
//     email:'asdf@asdf.com',
//     password:'dfasdf'
// })



export {User};