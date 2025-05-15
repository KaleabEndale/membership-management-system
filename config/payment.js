require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


async function  onetime (req,res,type,price,email,currency) {
  try{
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
       
        line_items: [{
            price_data: {
                currency: currency,
                product_data: {
                    name: type
                },
                unit_amount: price * 100
            },
            quantity: 1,
         
        }],
        client_reference_id:'membership',
        success_url: "http://localhost:5000/member/completeone?session_id={CHECKOUT_SESSION_ID}",
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



module.exports = onetime
