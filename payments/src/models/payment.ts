import mongoose from 'mongoose';

/*
this is for our collection of payments whose only purpose is to relate and order AND a payment from charge from the Stripe API
 This will allow us to keep track of which orders have been payed for, it will specifically
 relate the orderId with stripeId.
 */

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
    //payments arent updated, so version number isn't really needed
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}


const paymentSchema = new mongoose.Schema<PaymentDoc,PaymentModel>(
    {
        orderId: {
            required: true,
            type: String,
        },
        stripeId: {
            required: true,
            type: String,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    })




paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
    'Payment',
    paymentSchema
);

export { Payment };
