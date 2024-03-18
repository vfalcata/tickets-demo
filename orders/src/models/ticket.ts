import mongoose from 'mongoose';
import {Order,OrderStatus} from './order';

//we cannot export this to commons because the code here may be very specific to this service
//these attributes here are the fields that are needed for order service to work correctly

interface TicketAttrs{
    title: string;
    price: number;
    id: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs):TicketDoc;
    findByEvent(event: {id: string, version: number}):Promise<TicketDoc | null>;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema<TicketDoc,TicketModel>({
    title:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true,
        min: 0
    }
},{
    toJSON:{
        transform(doc,ret){
            ret.id=ret._id;
            delete ret._id;
        }
    }
})

ticketSchema.set('versionKey','version');

// module no longer requried, replaced with pre save middleware
// ticketSchema.plugin(updateIfCurrentPlugin)

//pre save middle ware that is called before each time a save is called
ticketSchema.pre('save',function (done){
    //mongo will query this.$where and update that entry when save is called
    this.$where = {
        version: this.get('version') -1
        //this is where we modify how the version is changed each time
    }
    done();
});

ticketSchema.statics.findByEvent = (event: {id: string, version: number})=>{
    return Ticket.findOne({
        _id: event.id,
        version: event.version -1
    })
}

//statics allow us to extend the actual ticket model itself with new properties
ticketSchema.statics.build = (attrs: TicketAttrs)=>{
    return new Ticket({
        //now that we list out the atts, one by one, so that we store an _id instead of id
        //any time more attributes are added we have to add them here too
        _id:attrs.id,
        title: attrs.title,
        price: attrs.price
    });
}

//to add a new method to a document
ticketSchema.methods.isReserved =async function (){
    //we need this scope, where 'this' refers to actual ticket document we are operation on
    // this === the ticket document that we just called 'isReserved' on
    //Make sure that this ticket is not already reserved
    //Run query to look at all orders. Find an order where the ticket is the ticket we just found AND the orders status is NOT cancelled.
    //If we find an order from that, it means the ticket IS reserved
    const existingOrder = await Order.findOne({
        ticket: this as any,
        status: {
            //special mongodb operator, checks for all values $in this set
            //if a ticket has any of these that ticket is already reserved
            $in:[
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export {Ticket};