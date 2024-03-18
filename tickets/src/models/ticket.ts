import mongoose from 'mongoose';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

interface TicketDoc extends mongoose.Document{
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?:string;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema<TicketDoc,TicketModel>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId:{
        type: String
    }
},{
    toJSON: {
        //we want to modify ret directly
        transform(doc,ret){
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

//remaps __v to version
ticketSchema.set('versionKey','version');

// @ts-ignore
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) =>{
    return new Ticket(attrs);
}
const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket',ticketSchema);
export {Ticket};