require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)




async function  subscription (req,res,type,price,email,currency,recurrence) {
    try{
      const product = await stripe.products.create({
    name: type, 
});


const priceValue = price * 100;

const priceObject = await stripe.prices.create({
    unit_amount: priceValue,  
    currency: currency,        
    recurring: {               
        interval: recurrence,
    },
    product: product.id,       
});

const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
        price: priceObject.id,  
        quantity: 1,
    }],
       client_reference_id:'membership',
        success_url: "http://localhost:5000/member/complete?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:5000/member/login",
       
        customer_email: email,
       expand: ['line_items']
    });
    res.redirect(session.url)
  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}


module.exports = subscription