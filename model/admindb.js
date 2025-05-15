const  Sequelize  = require('sequelize')
const sequelize = require('../config/db');


const admins = sequelize.define('admins',{
    id:{
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:false,
        unique:true
    },
    username:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
        unique:true

    },
    email:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    contact:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false
    },
    address:{
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

module.exports = admins



