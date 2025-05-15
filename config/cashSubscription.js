require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const mds = require('../model/mddb')
const transporter = require('../config/mail');
require('dotenv').config()



async function  cashSubscription (req,res,id,name,email,type,price,currency,recurrence) {
  try{
    const product = await stripe.products.create({ name: type })
    const Price = await stripe.prices.create({ unit_amount: price*100, currency: currency, recurring: { interval: recurrence }, product: product.id })
    const customer = await stripe.customers.create({email, name })
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: Price.id }],
        collection_method: 'send_invoice',
        days_until_due: 0,
        metadata: { payment_type: 'cash' , client_reference_id:'membership'}
    })
    const invoice = await stripe.invoices.pay(subscription.latest_invoice, { paid_out_of_band: true })
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
   
    
   await mds.create({id:id,subid:subscription.id,type:type,how:'subscription'})

   res.render('pfm',{showButton:false})
     } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}


module.exports = cashSubscription