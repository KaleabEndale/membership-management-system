const  Sequelize  = require('sequelize')
const sequelize = require('../config/db');


const actlogs = sequelize.define('actlogs',{
    username:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
    },
    action:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    date:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    detail:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    ip:{
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

module.exports = actlogs