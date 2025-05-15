const { Op } = require('sequelize'); 
const mis = require('../model/midb')
const mds = require('../model/mddb')
const members = require('../model/memberdb')
const transporter = require('../config/mail');
const { invoice } = require('./membersControllers');
const subscription = require('../config/subscription');
const actlogs = require('../model/actlogdb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
require('dotenv').config()




exports.getadmin = (req,res)=>{
    res.render('admin')
}

exports.getadminforgotpassword = (req,res)=>{
    res.render('afp')
}

exports.adminlogout = (req,res)=>{
    res.clearCookie('token')
    res.render('admin')
}

exports.getadminaddmember = (req,res)=>{
    res.render('addmember')
}

exports.getadminviewmember = (req,res)=>{
    res.render('viewmember')
}

exports.getadmineditmember = (req,res)=>{
    res.render('findmember')
}

exports.getadmindeletemember = (req,res)=>{
    res.render('deletemember')
}

exports.pfm = (req,res)=>{
  res.render('pfm',{showButton:false})
}


exports.getadminaddstaff = (req,res)=>{
    res.render('addstaff')
}

exports.getadminviewstaff = (req,res)=>{
    res.render('viewstaff')
}

exports.getadmineditstaff = (req,res)=>{
    res.render('findstaff')
}

exports.getadmindeletestaff = (req,res)=>{
    res.render('deletestaff')
}

exports.geteditmi = async(req,res)=>{
   const mt = req.body.mt
   const mi = await mis.findOne({where:{type:mt}})
   if(!mi){
    console.log('does not exist');
   }else{
    res.render('editmi',{mt:mi.type,price:mi.price,contract:mi.contract,inamharic:mi.inamharic})
   }
}

exports.posteditmi = async(req,res)=>{
    let {mt,price,contract,inamharic} = req.body
    if(mt === 'lifetime'){
        await mis.update({price:price,contract:contract,inamharic:inamharic},{where:{type:mt}})
         const md = await mds.findAll({where:{type:mt}})
               if(md){
 for(let element of md) {
    const m = await members.findOne({where:{id:element.id}})
    const email = m.email
        const up = await transporter.sendMail({
       from:'mms',
        to:email,
      subject:'subscription price update',
       text: `hi ${m.username}

       subscription : ${mt}
       price is now :${price}
    `   
  })
}
        res.redirect('http://localhost:5000/admin')
}else{
    await mis.update({price:price,contract:contract,inamharic:inamharic},{where:{type:mt}})
    res.redirect('http://localhost:5000/admin')
}
    }else{
        const md = await mds.findAll({where:{type:mt}})
        if(md){
 for(let element of md) {
    try{
         const subscription = await stripe.subscriptions.retrieve(element.subid)  
         const currency = subscription.currency
         let newprice;
            if(currency == 'etb'){
               newprice = Math.round(price * 132.13)
              }else if(currency == 'eur'){
              newprice = Math.round(price * 1.12)
             }else{
              newprice = Math.round(price)
             }
         
                const item = subscription.items.data[0];
                const oldPrice = item.price;
                const productId = oldPrice.product; 


               const product = await stripe.products.retrieve(productId); 
               if (!product.active) {
                   await stripe.products.update(productId, { active: true });
                   }
           
             const newPrice = await stripe.prices.create({
                unit_amount:newprice*100,
                currency:currency,
                recurring:{interval:oldPrice.recurring.interval},
                 product:oldPrice.product
            })

         await stripe.subscriptions.update(element.subid,{
            cancel_at_period_end:false,
            proration_behavior:'create_prorations',
            items:[{
                id:item.id,
                price:newPrice.id
            }]
         })
        } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
 const m = await members.findOne({where:{id:element.id}})
    const email = m.email
          const up = await transporter.sendMail({
       from:'mms',
        to:email,
      subject:'subscription price update',
       text: `hi ${m.username}

       subscription : ${mt}
       price is now :${price}
    `   
  })

        }
         await mis.update({price:price,contract:contract,inamharic:inamharic},{where:{type:mt}})
        res.redirect('http://localhost:5000/admin')
        }else{
             await mis.update({price:price,contract:contract,inamharic:inamharic},{where:{type:mt}})
        res.redirect('http://localhost:5000/admin')
        }
     
        
    }
    

}

exports.getsau = (req,res)=>{
    res.render('sau')
}




exports.temp1 = (req,res)=>{
    const subject = 'Important Update for All  Members'
    const text = `

We have some exciting news to share with you! At MMS, we’re constantly working to improve your experience, and we’re thrilled to announce [brief description of the update, e.g., a new feature or event].

This update is available to all our valued members. We hope you enjoy it!

If you have any questions or feedback, we’d love to hear from you.

Best,
The MMS Team`
res.render('sau',{subject:subject,text:text})
}

exports.temp2 = (req,res)=>{
    const subject = ' Update for Standard Membership Holders'
    const text = `

We wanted to reach out and let you know about a new update exclusively for Standard Members. You now have access to [brief description of new benefit or feature].

We truly value your support, and we hope this makes your experience even better!

If you’re interested in upgrading to Premium or Lifetime membership for even more benefits, feel free to reach out!

Kind regards,
The MMS Team`
 res.render('sau',{subject:subject,text:text})
}

exports.temp3 = (req,res)=>{
     const subject = 'Premium Membership Update'
    const text = `

As a Premium Member, you’re one of our top supporters, and we have a special update just for you! You can now enjoy [brief description of new premium feature or perk].

We’re always looking for ways to make your membership even more valuable. Stay tuned for more updates!

Thank you for being with us.
The MMS Team`
 res.render('sau',{subject:subject,text:text})  
}

exports.temp4 = (req,res)=>{
     const subject = ' Special Update for Premium and Lifetime Members'
    const text =`

We’re thrilled to share a new feature available exclusively for our Premium and Lifetime Members: [brief description of the feature or benefit].

Your continued support allows us to innovate and enhance the experience for our most dedicated members. We hope you enjoy this latest addition!

Thank you for being part of our community.
The MMS Team`
   res.render('sau',{subject:subject,text:text}) 
}

exports.temp5 = (req,res)=>{
     const subject = ' Lifetime Membership Perk Update'
    const text =`

We have something new just for you! As a Lifetime Member, you now have access to [brief description of new lifetime-exclusive feature or perk].

We’re constantly working to make your membership even more rewarding. Your loyalty means the world to us!

If you have any suggestions or need assistance, feel free to reach out.

Warm regards,
The MMS Team`
     res.render('sau',{subject:subject,text:text})
}


exports.sausa = async(req,res)=>{
    const subject = req.body.subject
    const text = req.body.text
const member = await members.findAll()
await member.forEach(async element => {
    const sent = await transporter.sendMail({
        from:'mms',
        to:element.email,
        subject:subject,
        text:`Hi ${member.username}
        
        ${text}`
      })
    
});
res.redirect('http://localhost:5000/admin')

}

exports.sauss = async(req,res)=>{
    const subject = req.body.subject
    const text = req.body.text
    const md = await mds.findAll({
        where: {
          type: {
            [Op.like]: '%standard%'
          } }
      })

      md.forEach(async element => {
        const member = await members.findOne({where:{id:element.id}})
        const sent = await transporter.sendMail({
            from:'mms',
            to:member.email,
          subject:subject,
        text:`Hi ${member.username}
        
        ${text}`
          })
      })
     res.redirect('http://localhost:5000/admin')
}

exports.sausp = async(req,res)=>{
    const subject = req.body.subject
    const text = req.body.text
    const md = await mds.findAll({
        where: {
          type: {
            [Op.like]: '%premium%'
          } }
      })

      md.forEach(async element => {
        const member = await members.findOne({where:{id:element.id}})
        const sent = await transporter.sendMail({
            from:'mms',
            to:member.email,
        subject:subject,
        text:`Hi ${member.username}
        
        ${text}`
          })
      }) 
     res.redirect('http://localhost:5000/admin')
}

exports.sauspl = async(req,res)=>{
    const subject = req.body.subject
    const text = req.body.text
    const md = await mds.findAll({
    where: {
        [Op.or]: [
          {
            type: {
              [Op.like]: '%premium%'
            }
          },
          {
            type: {
              [Op.like]: '%lifetime%'
            }}
        ] }
    }) 
    md.forEach(async element => {
        const member = await members.findOne({where:{id:element.id}})
        const sent = await transporter.sendMail({
            from:'mms',
            to:member.email,
         subject:subject,
        text:`Hi ${member.username}
        
        ${text}`
          })
      }) 
    res.redirect('http://localhost:5000/admin')
}

exports.sausl = async(req,res)=>{
    const subject = req.body.subject
    const text = req.body.text
    const md = await mds.findAll({
        where: {
          type: {
            [Op.like]: '%lifetime%'
          } }
      })

      md.forEach(async element => {
        const member = await members.findOne({where:{id:element.id}})
        const sent = await transporter.sendMail({
            from:'mms',
            to:member.email,
          subject:subject,
        text:`Hi ${member.username}
        
        ${text}`
          })
      }) 
      res.redirect('http://localhost:5000/admin')
}





exports.grr = async (req,res) => {
  try{
   const input  = req.body.date;
const months = [ [],[],[],[],[],[],[],[],[],[],[],[] ];

const currentyear = new Date().getFullYear();
const currentmonth = new Date().getMonth() + 1;

// for how == session
const sessions = await stripe.checkout.sessions.list({limit:100});
for(let i = 0; i < sessions.data.length; i++) {
    const session = sessions.data[i];
    if(session.client_reference_id === 'membership' ) {
        const sy = new Date(session.created * 1000).getFullYear();
        const sm = new Date(session.created * 1000).getMonth() + 1;
        if(sy == input) { 
            if(session.payment_status === 'unpaid'){
                  months[sm - 1].push({status:'canceled'}); 
            }else{
            if(session.mode === 'subscription') {
                const sub = await stripe.subscriptions.retrieve(session.subscription);
                months[sm - 1].push({status: sub.status});
            } else {
                const m = await mds.findOne({where: {subid: session.id}});
                months[sm - 1].push({status: m ? 'active' : 'canceled'});
            }
        }
        }
    }
}

// for how == subscription
const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'all' });
for(let i = 0; i < subscriptions.data.length; i++) {
    const subscription = subscriptions.data[i];
    const sy = new Date(subscription.created * 1000).getFullYear();
    const sm = new Date(subscription.created * 1000).getMonth() + 1;
    if(subscription.metadata.client_reference_id === 'membership' && sy == input) { 
        months[sm - 1].push({status: subscription.status});
    }
}

// for how == invoice
const invoices = await stripe.invoices.list({ limit: 100 });
for(let i = 0; i < invoices.data.length; i++) {
    const invoice = invoices.data[i];
    const sy = new Date(invoice.created * 1000).getFullYear();
    const sm = new Date(invoice.created * 1000).getMonth() + 1;
    if(invoice.metadata.client_reference_id === 'membership' && invoice.status !== 'paid' && sy == input) { 
        if(invoice.status === 'open') {
            months[sm - 1].push({status: 'active'});
        } else if(invoice.status === 'void') {
            months[sm - 1].push({status: 'canceled'});
        }
    }
}

let reportData = [];

if (input == currentyear) {
    for (let m = 0; m < currentmonth; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            growth: months[m].length,
            retention: months[m].filter(item => item.status === 'active').length
        });
    }
} else if (input > currentyear) {
    reportData.push({ month: 'Not there yet', growth: '-', retention: '-' });
} else {
    for (let m = 0; m < 12; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            growth: months[m].length,
            retention: months[m].filter(item => item.status === 'active').length
        });
    }
}

res.render('report', {type:'grr',first:'Growth',second:'Retention',
    rn: `Growth and Retention Report for ${input}`,
    r: reportData
});

  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
 
}
     


exports.prr = async (req,res) => {
  try{
  const input  = req.body.date
  const months = [ [],[],[],[],[],[],[],[],[],[],[],[] ]
  let rmonths = [0,0,0,0,0,0,0,0,0,0,0,0];
      
  const currentyear = new  Date().getFullYear()
  const currentmonth = new Date().getMonth() + 1

 // for how == session 
 const sessions = await stripe.checkout.sessions.list({limit:100})
 for(let i=0; i<sessions.data.length; i++){
  const session = sessions.data[i]
  if(session.client_reference_id === 'membership' && session.payment_status === 'paid'){
   const sy = new Date(session.created*1000).getFullYear()
   const sm =  new Date(session.created*1000).getMonth() + 1
    
   if(sy == input){
       months[sm - 1].push(session.id) 
       if(session.currency == 'etb'){
       rmonths[sm-1] += ((session.amount_total / 100) / 132.13)
       }else if(session.currency == 'eur'){
        rmonths[sm-1] += ((session.amount_total / 100) / 1.12)
       }else{
        rmonths[sm-1] += (session.amount_total / 100)
       }
         }   
      }
   }

//for how == subscription
const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'all' });
for(let i = 0; i < subscriptions.data.length; i++) {
    const subscription = subscriptions.data[i];
    const sy = new Date(subscription.created * 1000).getFullYear();
    const sm = new Date(subscription.created * 1000).getMonth() + 1;
    if(subscription.metadata.client_reference_id === 'membership' && sy == input) { 
           months[sm - 1].push(subscription.id) 
       if(subscription.currency == 'etb'){
       rmonths[sm-1] += ((subscription.items.data[0].price.unit_amount / 100) / 132.13)
       }else if(subscription.currency == 'eur'){
        rmonths[sm-1] += ((subscription.items.data[0].price.unit_amount / 100) / 1.12)
       }else{
        rmonths[sm-1] += (subscription.items.data[0].price.unit_amount / 100)
       }
    }
}


//for how == invoice
const invoices = await stripe.invoices.list({ limit: 100 });
for(let i = 0; i < invoices.data.length; i++) {
    const invoice = invoices.data[i];
    const sy = new Date(invoice.created * 1000).getFullYear();
    const sm = new Date(invoice.created * 1000).getMonth() + 1;
    if(invoice.metadata.client_reference_id === 'membership' && invoice.status !== 'paid' && sy == input) { 
             months[sm - 1].push(invoice.id) 
       if(invoice.currency == 'etb'){
       rmonths[sm-1] += ((invoice.amount_due / 100) / 132.13)
       }else if(invoice.currency == 'eur'){
        rmonths[sm-1] += ((invoice.amount_due / 100) / 1.12)
       }else{
        rmonths[sm-1] += (invoice.amount_due / 100)
       }
    }
}






let reportData = [];

if (input == currentyear) {
    for (let m = 0; m < currentmonth; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            payments: months[m].length,
            revenue: `${rmonths[m]}$`
        });
    }
} else if (input > currentyear) {
    reportData.push({ month: 'Not there yet', payments: '-', revenue: '-' });
} else {
    for (let m = 0; m < 12; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            payments: months[m].length,
            revenue: `${rmonths[m]}$`
        });
    }
}

res.render('report', {type:'prr',first:'Payment',second:'Revenue',
    rn: `Payment and Revenue Report for ${input}`,
    r: reportData
});


  } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
  
}



exports.eurr = async (req,res) => {
    try{
const input  = req.body.date
const months = [ [],[],[],[],[],[],[],[],[],[],[],[] ];
const renew =  [ [],[],[],[],[],[],[],[],[],[],[],[] ];
 const currentyear = new  Date().getFullYear()
  const currentmonth = new Date().getMonth() + 1

// for how == session
const sessions = await stripe.checkout.sessions.list({limit:100});
for(let i = 0; i < sessions.data.length; i++) {
    const session = sessions.data[i];
    if(session.client_reference_id === 'membership' ) {
        const sy = new Date(session.created * 1000).getFullYear();
        const sm = new Date(session.created * 1000).getMonth() + 1;
        if(sy == input) { 
            if(session.payment_status === 'unpaid'){
                  months[sm - 1].push({status:'canceled'}); 
            }else{
            if(session.mode === 'subscription') {
                const sub = await stripe.subscriptions.retrieve(session.subscription);
                months[sm - 1].push({status: sub.status});
                if(sub.status === 'active'){
                   renew[sm - 1].push({status: sub.status}); 
                }
            } else {
                const m = await mds.findOne({where: {subid: session.id}});
                months[sm - 1].push({status: m ? 'active' : 'canceled'});
            }
        }
        }
    }
}

// for how == subscription
const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'all' });
for(let i = 0; i < subscriptions.data.length; i++) {
    const subscription = subscriptions.data[i];
    const sy = new Date(subscription.created * 1000).getFullYear();
    const sm = new Date(subscription.created * 1000).getMonth() + 1;
    if(subscription.metadata.client_reference_id === 'membership' && sy == input) { 
        months[sm - 1].push({status: subscription.status});
          if(subscription.status === 'active'){
                   renew[sm - 1].push({status: subscription.status}); 
                }
    }
}

// for how == invoice
const invoices = await stripe.invoices.list({ limit: 100 });
for(let i = 0; i < invoices.data.length; i++) {
    const invoice = invoices.data[i];
    const sy = new Date(invoice.created * 1000).getFullYear();
    const sm = new Date(invoice.created * 1000).getMonth() + 1;
    if(invoice.metadata.client_reference_id === 'membership' && invoice.status !== 'paid' && sy == input) { 
        if(invoice.status === 'open') {
            months[sm - 1].push({status: 'active'});
        } else if(invoice.status === 'void') {
            months[sm - 1].push({status: 'canceled'});
        }
    }
}

let reportData = [];

if (input == currentyear) {
    for (let m = 0; m < currentmonth; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            expired: months[m].filter(item => 
                item.status === 'canceled' || 
                item.status === 'incomplete_expired' || 
                item.status === 'unpaid'
            ).length,
            upcoming: renew[m].length
        });
    }
} else if (input > currentyear) {
    reportData.push({ month: 'Not there yet', expired: '-', upcoming: '-' });
} else {
    for (let m = 0; m < 12; m++) {
        reportData.push({
            month: `Month ${m + 1}`,
            expired: months[m].filter(item => 
                item.status === 'canceled' || 
                item.status === 'incomplete_expired' || 
                item.status === 'unpaid'
            ).length,
            upcoming: renew[m].length
        });
    }
}

res.render('report', {type:'eurr',first:'Expired',second:'Upcoming Renewal',
    rn: `Expired and Upcoming Renewal report for ${input}`,
    r: reportData
});





         } catch (error) {
        console.error('Error fetching data from stripe , ERROR : ', error.message);
        res.status(500).send('Error fetching data from stripe');
    }
}



exports.al = async (req,res) => {
 const date = req.body.date;
const actlog = await actlogs.findAll({
  where: {
    date: {
      [Op.like]: `%${date}%`
    }
  }
});

let array = [];
actlog.forEach(element => {
  array.push({
    username: element.username,
    action: element.action,
    date: element.date,
    detail: element.detail,
    ip: element.ip
  });
});

res.render('report1', {
  rn: `Activity log for ${date}`,
  r: array
});

}