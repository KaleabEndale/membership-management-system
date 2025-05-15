const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const admins  = require('../model/admindb')
const staffs = require('../model/staffdb')
const members = require('../model/memberdb')
const mds = require('../model/mddb')
const transporter = require('../config/mail')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const logs = require('../config/log')
require('dotenv').config()


 exports.aam = async(req,res,next)=>{
    const token = req.cookies.token
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async (err,admin)=>{
            if(err){
                 return res.render('admin')
            }else{ 
               const a = await admins.findOne({where:{id:admin.id}})
               if(!a){
                return res.render('admin')
               }else{
                return res.render('aprofile',{an:a.username})
               }
               
            }
            })   
     }else{
        next()
    }    
}


exports.sam =  async (req,res,next)=>{
    const token = req.cookies.token
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,staff)=>{
            if(err){
                 return res.render('staff')
            }else{ 
               const s = await staffs.findOne(({where:{id:staff.id}}))
               if(!s){
                return res.render('staff')
               }else{
                return res.render('sprofile',{sn:s.username})
               }
            }
            })   
     }else{
        next()
    }    
}



exports.mam =  async (req,res,next)=>{
    try{
    const token = req.cookies.token
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                 return res.render('mlogin')
            }else{ 
               const m = await members.findOne({where:{id:member.id}})
               if(!m){
                return res.render('mlogin')
               }else{
                const sub = await mds.findOne({where:{id:m.id}}) 
                if(!sub){
                    logs(m.username,'login','user logged in successfully',ip)
                   return res.render('mprofile',{mn:m.username,me:m.email,mc:m.contact,ma:m.address})
                 
                    
                }else{
                    if(sub.how == 'session' || sub.how == 'subscription'){
                    if(sub.type == 'lifetime'){
                        const session = await stripe.checkout.sessions.retrieve(sub.subid, { expand: ['line_items'] })
                        const line_items = await stripe.checkout.sessions.listLineItems(sub.subid,{limit:10})
                        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
                    
                        const email = session.customer_email
                        const items = line_items.data.map(item =>({
                            name:item.description,
                            amount: item.amount_total / 100,
                            currency : item.currency
                            
                        }))
                        const name = items[0].name
                        const amount = items[0].amount
                        const currency = items[0].currency
                        const paymentTimestamp = new Date( paymentIntent.created * 1000)
                         const paymentTIme = paymentTimestamp.toDateString()

                         logs(m.username,'login','user logged in successfully',ip)
                         res.render('mprofile2',{showButton:false,si:sub.subid,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:'active',med:'never',mod:0,mmc:currency})
              
            
                    }else{
                       
            const subscription = await stripe.subscriptions.retrieve(sub.subid)
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
            const price = subscription.items.data[0].price
            const product = await stripe.products.retrieve(price.product) 
            const invo = await stripe.invoices.list({subscription:sub.subid,status:'open',limit:10})
            
            
            const paymentTimestamp = new Date( invoice.status_transitions.paid_at * 1000)
            const paymentTIme = paymentTimestamp.toDateString()
            const status = subscription.status
            const name = product.name
            const amount = price.unit_amount / 100
            const currency = price.currency
            const email = invoice.customer_email
            const interval = price.recurring.interval
            let expiredate = new Date(paymentTIme)
            if (interval == 'month') {
            expiredate.setMonth(expiredate.getMonth() + 1)
            } else if (interval == 'year') {
            expiredate.setFullYear(expiredate.getFullYear() + 1)
            }
            let outstandingdue = 0
            invo.data.forEach(inv => {
            outstandingdue +=inv.amount_due
            });
            outstandingdue = outstandingdue / 100
            
            const expdate = new Date(expiredate)
            const currentDate = new Date()

            const today = currentDate.setHours(0,0,0,0)
            const difftime = expiredate - today
            const diffdays = difftime / (1000 * 60 * 60 * 24)
            

            if(diffdays === 3){
                const sent = await transporter.sendMail({
                    from:'mms',
                    to:email,
                    subject:'subscription expiration reminder',
                    text:'Hello! Your subscription will expire in 3 days. Please renew it to continue enjoying our services.'
                  })
            }

            if(expdate < currentDate){
                logs(m.username,'login','user logged in successfully',ip)
                res.render('mprofile2',{showButton:true,msg:'subscription expired',si:sub.subid,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:status,med:expiredate,mod:outstandingdue,mmc:currency})
            }
            else{
                logs(m.username,'login','user logged in successfully',ip)
                res.render('mprofile2',{showButton:true,si:sub.subid,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:status,med:expiredate,mod:outstandingdue,mmc:currency})
                  
            } 
                   }
                   
                   
            
            }else if(sub.how == 'invoice'){
             const invoice = await stripe.invoices.retrieve(sub.subid);
            const  name = invoice.lines.data[0].description
            const  currency = invoice.currency
                logs(m.username,'login','user logged in successfully',ip)
                     res.render('mprofile2',{showButton:false,si:sub.subid,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:'active',med:'never',mod:0,mmc:currency})
            
            }
        }

               }
            }
            })   
     }else{
        next()
    } 
      } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }   
}


