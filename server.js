const express = require('express')
const membersRoutes = require('./routes/membersRoutes')
const adminsRoutes = require('./routes/adminsRoutes')
const staffsRoutes = require('./routes/staffsRoutes')
const avedRoutes = require('./routes/avedRoutes')
const cookieParser = require('cookie-parser')



process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); 
});



const app = express()
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())
app.set('trust proxy',true)




app.get('/',(req,res)=>{
    res.render('home')
})



app.use('/admin',adminsRoutes)
app.use('/staff',staffsRoutes)
app.use('/member',membersRoutes)
app.use('/aved',avedRoutes)



app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Internal Server Error');
});



app.listen(5000,()=>console.log('running on port 5000'))



