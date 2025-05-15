const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const mds = require('../model/mddb')
const transporter = require('../config/mail');
require('dotenv').config()

async function  cashPayment (req,res,id,name,email,type,price,currency) {
    try{
    const customer = await stripe.customers.create({ name, email });
    await stripe.invoiceItems.create({
        customer: customer.id,
        unit_amount_decimal: (price * 100).toFixed(2) ,
        quantity:1,
        currency: currency, 
        description:type        
    });
    const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 0,
        auto_advance:false,
        pending_invoice_items_behavior:'include',
        metadata: {
            payment_type: 'cash',
           client_reference_id:'membership'
        },
    });

    await stripe.invoices.finalizeInvoice(invoice.id);
    const paymentTimestamp = invoice.created * 1000
    const paymentTime = new Date(paymentTimestamp).toDateString();

    const reciept = await transporter.sendMail({
        from:'mms',
        to:email,
        subject:'reciept',
        text: `
                   subscription payment reciept
           name : ${name}
           subscription : ${type}
           amount : ${price} ${currency}
           paid at : ${paymentTime}
        `
      })
   
    
   await mds.create({id:id,subid:invoice.id,type:type,how:'invoice'})
    res.render('pfm',{showButton:false})
  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}

module.exports = cashPayment