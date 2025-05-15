const  Sequelize  = require('sequelize')
const sequelize = require('../config/db');


const mis = sequelize.define('mis',{
   
    type:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    recurrence:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
    },
    price:{
        type:Sequelize.DataTypes.DOUBLE,
        allowNull:false
    },
    contract:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    inamharic:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false 
    }
},{ timestamps: false })

sequelize.authenticate()
    .then((result) => {
        console.log('connected');
    }).catch((err) => {
        console.log(err);
    });

module.exports = mis



 
