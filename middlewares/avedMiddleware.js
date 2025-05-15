const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const admins  = require('../model/admindb')
const staffs = require('../model/staffdb')
const members = require('../model/memberdb')
require('dotenv').config()




exports.staffcheck = async(req,res,next)=>{
    const token = req.cookies.token
    if(!token){
       return res.render('mhome')
    }else{
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,staff)=>{
            if(err){
                 return res.render('mhome')
            }else{ 
               const s = await staffs.findOne({where:{id:staff.id}})
               if(!s){
                return res.render('mhome')
               }else{
              next()
               }
            }
            })   
     }
}


exports.admincheck = async(req,res,next)=>{
    const token = req.cookies.token
    if(!token){
       return res.render('mhome')
    }else{
        const decode =  jwt.verify(token,process.env.ACCESS_TOKEN,async(err,admin)=>{
            if(err){
                 return res.render('mhome')
            }else{ 
               const a = await admins.findOne({where:{id:admin.id}})
               if(!a){
                return res.render('mhome')
               }else{
              next()
               }
            }
            })   
     }
}