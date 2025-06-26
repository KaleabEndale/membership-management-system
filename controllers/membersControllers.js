const subscription= require('../config/subscription')
const onetime = require('../config/payment')
const members = require('../model/memberdb')
const jwt = require('jsonwebtoken')
const mis = require('../model/midb')
const { request } = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const mds = require('../model/mddb')
const transporter = require('../config/mail')
const logs = require('../config/log')
require('dotenv').config()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')


exports.getmhome = (req,res)=>{
    res.render('mhome')
}

exports.getreg = (req,res)=>{
    res.render('mreg')
}

exports.getlogin = (req,res)=>{
    res.render('mlogin')
}

exports.getmemberforgotpassword = (req,res)=>{
    res.render('mfp')
}

exports.memberlogout = (req,res)=>{
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const token = req.cookies.token
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.clearCookie('token')
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                logs(m.username,'logout','user logged out successfully',ip)
                res.clearCookie('token')
                res.render('mlogin')
            }
        })

    
}

exports.getup = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
    const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
        if(err){
            res.render('mlogin')
        }else{ 
            const m = await members.findOne({where:{id:member.id}})
            if(lang === 'eng'){
                res.render('up',{lang:lang,upp:'UPDATE PROFILE',u:'username',c:'contact',e:'email',a:'address',up:'update',username:m.username,contact:m.contact,email:m.email,address:m.address}) 
            }else if(lang === 'amh'){
                res.render('up',{lang:lang,upp:'ገጽታ አስተካክል',u:'ስም',c:'ስልክ ቁጥር',e:'ኢሜል',a:'አድራሻ',up:'አስተካክል',username:m.username,contact:m.contact,email:m.email,address:m.address}) 
            }
         
        }
    })
    
}

exports.postup = async(req,res)=>{
     const errors = validationResult(req);
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const {username,contact,email,address,lang} = req.body
    const m = await members.findOne({where:{username:username}})
    const mt = await mds.findOne({where:{id:m.id}})
      if(!errors.isEmpty()){ 
       const isEmpty = errors.array().map(err=>err.msg)
       if(lang === 'eng'){
         res.render('up',{mu:isEmpty,lang:lang,upp:'UPDATE PROFILE',u:'username',c:'contact',e:'email',a:'address',up:'update',username:m.username,contact:m.contact,email:m.email,address:m.address})
       }else if(lang === 'amh'){
                res.render('up',{mu:isEmpty,lang:lang,upp:'ገጽታ አስተካክል',u:'ስም',c:'ስልክ ቁጥር',e:'ኢሜል',a:'አድራሻ',up:'አስተካክል',username:m.username,contact:m.contact,email:m.email,address:m.address}) 
            }
   }else{
     if(!mt){
         await members.update({contact:contact,email:email,address:address},{where:{username:username}})
    logs(username,'update','user updated profile successfully',ip)
    res.redirect('http://localhost:5000/member/login') 
     }
     else if(mt.type == 'lifetime'){
 await members.update({contact:contact,email:email,address:address},{where:{username:username}})
    logs(username,'update','user updated profile successfully',ip)
    res.redirect('http://localhost:5000/member/login')
     }else{
        try{
        const sub = await stripe.subscriptions.retrieve(mt.subid)
        const cusid = sub.customer
        await stripe.customers.update(cusid,{
            email:email
        })
    await members.update({contact:contact,email:email,address:address},{where:{username:username}})
    logs(username,'update','user updated profile successfully',ip)
    res.redirect('http://localhost:5000/member/login')
          } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }    
     }   
}
}

exports.uppass = async(req,res)=>{
  const lang = req.body.lang
   if(lang === 'eng'){
         res.render('changepass',{lang:lang,cpb:'change password',cp:'CHANGE PASSWORD',op:'old Password',np:'new Password'})
       }else if(lang === 'amh'){
      res.render('changepass',{lang:lang,cpb:'ፓስወርድ ቀይር',cp:'ፓስወርድ ቀይር',op:'የድሮ ፓስወርድ',np:'አዲስ ፓስወርድ'})
            }
}

exports.changepass = async(req,res)=>{
     const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const errors = validationResult(req)
    const oldpassword= req.body.oldpassword
    const newpassword = req.body.newpassword
    const token = req.cookies.token
    const lang = req.body.lang
if(!errors.isEmpty()){
        const isEmpty = errors.array().map(err=>err.msg)
           if(lang === 'eng'){
         res.render('changepass',{lang:lang,cpb:'change password',cp:'CHANGE PASSWORD',op:'old Password',np:'new Password',mu:isEmpty,oldpassword:oldpassword,newpassword:newpassword})
       }else if(lang === 'amh'){
      res.render('changepass',{lang:lang,cpb:'ፓስወርድ ቀይር',cp:'ፓስወርድ ቀይር',op:'የድሮ ፓስወርድ',np:'አዲስ ፓስወርድ',mu:isEmpty,oldpassword:oldpassword,newpassword:newpassword})
            }
    }else{
    const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
        if(err){
            res.render('mlogin')
        }else{ 
            const m = await members.findOne({where:{id:member.id}})
            const p = await bcrypt.compare(oldpassword,m.password)    
            if(p){
                await members.update({password:newpassword},{where:{id:m.id}})
                logs(m.username,'change password','user changed password successfully',ip)
                res.redirect('http://localhost:5000/member/login')
                
            }else{
        if(lang === 'eng'){
         res.render('changepass',{lang:lang,cpb:'change password',cp:'CHANGE PASSWORD',op:'old Password',np:'new Password',mu:'wrong password',oldpassword:oldpassword,newpassword:newpassword})
       }else if(lang === 'amh'){
      res.render('changepass',{lang:lang,cpb:'ፓስወርድ ቀይር',cp:'ፓስወርድ ቀይር',op:'የድሮ ፓስወርድ',np:'አዲስ ፓስወርድ',mu:'የተሳሳተ ፓስወርድ',oldpassword:oldpassword,newpassword:newpassword})
            }
            }
        }
    })
} 


}


exports.standardmonthly = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
   
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                const mi = await mis.findOne({where:{type:'standard monthly'}})
                if(lang === 'amh'){
                    res.render('invoice',{invoice:'ፋክቱር',c:'ምንዛሬ ይምረጡ ፡ ዋጋው በኋላ ይቀየራል',u:'ስም',e:'ኢሜል',t:'አይንት',p:'ዋጋ',ag:'እስማማለው',pay:'ክፈል', username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.inamharic,reccurence:mi.recurrence})
                }else{
                res.render('invoice',{invoice:'invoice',c:'choose currency : price will be converted later',u:'username',e:'email',t:'type',p:'price',ag:'i agree',pay:'pay',username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.contract,reccurence:mi.recurrence})
                }
            }
        })
}else{
    res.render('mlogin')
}
}

exports.standardyearly = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                const mi = await mis.findOne({where:{type:'standard yearly'}})
                if(lang === 'amh'){
                    res.render('invoice',{invoice:'ፋክቱር',c:'ምንዛሬ ይምረጡ ፡ ዋጋው በኋላ ይቀየራል',u:'ስም',e:'ኢሜል',t:'አይንት',p:'ዋጋ',ag:'እስማማለው',pay:'ክፈል', username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.inamharic,reccurence:mi.recurrence})
                }else{
                res.render('invoice',{invoice:'invoice',c:'choose currency : price will be converted later',u:'username',e:'email',t:'type',p:'price',ag:'i agree',pay:'pay',username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.contract,reccurence:mi.recurrence})
                }
            }
        })
}else{
    res.render('mlogin')
}
}

exports.premiummonthly = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                const mi = await mis.findOne({where:{type:'premium monthly'}})
                if(lang === 'amh'){
                    res.render('invoice',{invoice:'ፋክቱር',c:'ምንዛሬ ይምረጡ ፡ ዋጋው በኋላ ይቀየራል',u:'ስም',e:'ኢሜል',t:'አይንት',p:'ዋጋ',ag:'እስማማለው',pay:'ክፈል', username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.inamharic,reccurence:mi.recurrence})
                }else{
                res.render('invoice',{invoice:'invoice',c:'choose currency : price will be converted later',u:'username',e:'email',t:'type',p:'price',ag:'i agree',pay:'pay',username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.contract,reccurence:mi.recurrence})
                }
            }
        })
}else{
    res.render('mlogin')
} 
}

exports.premiumyearly = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                const mi = await mis.findOne({where:{type:'premium yearly'}})
                if(lang === 'amh'){
                    res.render('invoice',{invoice:'ፋክቱር',c:'ምንዛሬ ይምረጡ ፡ ዋጋው በኋላ ይቀየራል',u:'ስም',e:'ኢሜል',t:'አይንት',p:'ዋጋ',ag:'እስማማለው',pay:'ክፈል', username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.inamharic,reccurence:mi.recurrence})
                }else{
                res.render('invoice',{invoice:'invoice',c:'choose currency : price will be converted later',u:'username',e:'email',t:'type',p:'price',ag:'i agree',pay:'pay',username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.contract,reccurence:mi.recurrence})
                }
            }
        })
}else{
    res.render('mlogin')
}
}

exports.lifetime = (req,res)=>{
    const token = req.cookies.token
    const lang = req.body.lang
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                res.render('mlogin')
            }else{ 
                const m = await members.findOne({where:{id:member.id}})
                const mi = await mis.findOne({where:{type:'lifetime'}})
                if(lang === 'amh'){
                    res.render('invoice',{invoice:'ፋክቱር',c:'ምንዛሬ ይምረጡ ፡ ዋጋው በኋላ ይቀየራል',u:'ስም',e:'ኢሜል',t:'አይንት',p:'ዋጋ',ag:'እስማማለው',pay:'ክፈል', username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.inamharic,reccurence:mi.recurrence})
                }else{
                res.render('invoice',{invoice:'invoice',c:'choose currency : price will be converted later',u:'username',e:'email',t:'type',p:'price',ag:'i agree',pay:'pay',username:m.username,email:m.email,type:mi.type,price:mi.price,contract:mi.contract,reccurence:mi.recurrence})
                }
            }
        })
}else{
    res.render('mlogin')
}  
}

exports.invoice = (req,res)=>{
    try{
    let {type,reccurence,price,email,currency} = req.body
if(currency == 'etb'){
    price = (price * 132.13).toFixed(3)
}else if(currency == 'eur'){
    price = (price * 1.12).toFixed(3)
}


if(reccurence == 'once'){
    onetime(req,res,type,price,email,currency)
}else{
    subscription(req,res,type,price,email,currency,reccurence)  
} 
  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    } 
}

exports.complete = async(req,res)=>{
     try{
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['line_items', 'invoice'] })
    const subid = session.subscription
    const subscription = await stripe.subscriptions.retrieve(subid)
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
    const price = subscription.items.data[0].price
    const product = await stripe.products.retrieve(price.product) 
    const invo = await stripe.invoices.list({subscription:subid,status:'open',limit:10})


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

    
/*
     console.log('status :', status)
     console.log('expire date : ', expiredate)
     console.log('outstanding due :', outstandingdue )
     console.log('email : ', email)
     console.log('name :', name)
     console.log('amount :', amount)
     console.log('currency : ', currency)
     console.log('payment time : ', paymentTIme)
     console.log('subid : ', subid)
*/

  const mem = await members.findOne({where:{email:email}})
const reciept = await transporter.sendMail({
    from:'mms',
    to:email,
    subject:'reciept',
    text: `
               subscription payment reciept
        name : ${mem.username}
       subscription : ${name}
       amount : ${amount} ${currency}
       paid at : ${paymentTIme}
    `
    
  })


  logs(mem.username,'create subscription',`user created ${name} subscription successfully`,ip)


const token = req.cookies.token
    if(token){
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
            if(err){
                 return res.render('mlogin')
            }else{ 
               const m = await members.findOne({where:{id:member.id}})
               if(!m){
                return res.render('mlogin')
               }else{
                mds.sync()
               .then(()=>{
               return mds.create({id:m.id,subid:subid,type:name,how:'session'})
                    })
              .then((data)=>{

                res.render('mprofile2',{showButton:true,si:subid,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:status,med:expiredate,mod:outstandingdue,mmc:currency})
                    })
               }
            }
            })   
     }else{
        return res.render('mlogin')
    }   

  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
      
}

exports.completeone = async(req,res)=>{
    try{
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const session_id = req.query.session_id
    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ['line_items'] })
    const line_items = await stripe.checkout.sessions.listLineItems(session_id,{limit:10})
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

         
/*
     console.log('email : ', email)
     console.log('name :', name)
     console.log('amount :', amount)
     console.log('currency : ', currency)
     console.log('payment time : ', paymentTIme)
     console.log('subid : ', session_id)
*/
  const mem = await members.findOne({where:{email:email}})
const reciept = await transporter.sendMail({
    from:'mms',
    to:email,
    subject:'reciept',
    text: `
               subscription payment reciept
        name : ${mem.username}
       subscription : ${name}
       amount : ${amount} ${currency}
       paid at : ${paymentTIme}
    `
    
  })


  logs(mem.username,'create subscription',`user created ${name} subscription successfully`,ip)

  
const token = req.cookies.token
if(token){
    const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,member)=>{
        if(err){
             return res.render('mlogin')
        }else{ 
           const m = await members.findOne({where:{id:member.id}})
           if(!m){
            return res.render('mlogin')
           }else{
            mds.sync()
           .then(()=>{
           return mds.create({id:m.id,subid:session_id,type:name,how:'session'})
                })
          .then((data)=>{
            res.render('mprofile2',{showButton:false,si:session_id,mn:m.username,mc:m.contact,me:m.email,ma:m.address,mmt:name,mms:'active',med:'never',mod:0,mmc:currency})
                })
           }
        }
        })   
 }else{
    return res.render('mlogin')
}   

  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }

}

exports.paymenthistory = async(req,res)=>{
    try{
const subid = req.body.si
const type = req.body.mmt
const lang = req.body.lang
const md = await mds.findOne({where:{subid:subid}})
if(md.how == 'subscription' || md.how == 'session'){
if(type == 'lifetime'){
const session = await stripe.checkout.sessions.retrieve(subid,{expand:['line_items','customer']})
const payment = {
    email:session.customer_email,
    amount:(session.amount_total / 100).toFixed(2),
    name: session.line_items.data[0].description,
    currency:session.currency,
    paymentTime : new Date(session.created*1000).toDateString()
}
if(lang === 'amh'){
res.render('paymenthistory1',{  ph: "የክፍያ ታሪክ", e: "ኢሜል", s: "እቅድ", a: "ገንዘብ", pt: "ክፍያ ጊዜ",payment:payment})
}else{
res.render('paymenthistory1',{     ph: "Payment History", e: "Email",s: "Subscription",a: "Amount",pt: "Payment Time",payment:payment})
}

}else{
    const invoices = await stripe.invoices.list({
       subscription : subid
    })
    const payment = invoices.data.map(invoice =>({
        email:invoice.customer_email,
        amount: ((invoice.amount_paid / 100).toFixed(2) == 0 ? (invoice.lines.data[0].amount/100).toFixed(2) : (invoice.amount_paid / 100).toFixed(2)) ,
        name: invoice.lines.data[0].description.split(' ')[2] + ' ' +invoice.lines.data[0].description.split(' ')[3],
        currency:invoice.currency,
        paymentTime : new Date(invoice.created*1000).toDateString()
    }) )
   if(lang === 'amh'){
res.render('paymenthistory',{  ph: "የክፍያ ታሪክ", e: "ኢሜል", s: "እቅድ", a: "ገንዘብ", pt: "ክፍያ ጊዜ",payment:payment})
}else{
res.render('paymenthistory',{     ph: "Payment History", e: "Email",s: "Subscription",a: "Amount",pt: "Payment Time",payment:payment})
}
}
}else{

     const invoice = await stripe.invoices.retrieve(subid);
     const paymentTimestamp = invoice.created * 1000
    const paymentTime = new Date(paymentTimestamp).toDateString();
        
          

        const payment = {
    email : invoice.customer_email,
   amount : (invoice.amount_due / 100).toFixed(2),
    name : invoice.lines.data[0].description,
    currency:invoice.currency,
    paymentTime : paymentTime
}
if(lang === 'amh'){
res.render('paymenthistory1',{  ph: "የክፍያ ታሪክ", e: "ኢሜል", s: "እቅድ", a: "ገንዘብ", pt: "ክፍያ ጊዜ",payment:payment})
}else{
res.render('paymenthistory1',{     ph: "Payment History", e: "Email",s: "Subscription",a: "Amount",pt: "Payment Time",payment:payment})
}
}
  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}

exports.cancelsubscription = async(req,res)=>{
    try{
    const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    const subid = req.body.si
    const type = req.body.mmt
    const m = await mds.findOne({where:{subid:subid}})
    const id = m.id
    const member = await members.findOne({where:{id:id}})
      await mds.destroy({where:{subid:subid}})
    const delsub = await stripe.subscriptions.cancel(subid)
    logs(member.username,'cancel subscription',`user canceled ${type} subscription successfully`,ip)
   res.render('mprofile',{mn:member.username,me:member.email,mc:member.contact,ma:member.address}) 


  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}

exports.tac = async(req,res)=>{
    const type = req.body.mmt
    const m = await mis.findOne({where:{type:type}})
    res.render('tac',{tac:m.contract,tacia:m.inamharic})
}



exports.upm = async(req,res)=>{
    const subid = req.body.si
        const subscription = await stripe.subscriptions.retrieve(subid)
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
    const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        customer: subscription.customer,
        payment_method_types: ['card', 'cashapp'],
        success_url: `http://localhost:5000/member/successupm?session_id={CHECKOUT_SESSION_ID}&sub_id=${subid}`,
        cancel_url: "http://localhost:5000/member/login"
    })

    res.redirect(session.url)
}


exports.successupm = async(req,res)=>{
     const ip =   req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
     const sessionid = req.query.session_id
    const subid = req.query.sub_id
    const session = await stripe.checkout.sessions.retrieve(sessionid, { expand: ['setup_intent.payment_method'] })
    const paymentMethodId = session.setup_intent.payment_method.id
    const paymentType = session.setup_intent.payment_method.type
    await stripe.subscriptions.update(subid, {
        default_payment_method: paymentMethodId,
        collection_method: 'charge_automatically',
        metadata: {
            payment_type: paymentType
        }
    })
    const m = await mds.findOne({where:{subid:subid}})
    const id = m.id
    const member = await members.findOne({where:{id:id}})
     logs(member.username,'update payment method',`user update payment method to ${paymentType} successfully`,ip)
    res.redirect('http://localhost:5000/member/login')
}