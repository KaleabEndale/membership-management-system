const  Sequelize  = require('sequelize')
const sequelize = require('../config/db');

const mds = sequelize.define('mds',{
    id:{
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull:false,
        unique:true
    },
    subid:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
        unique:true

    },
    type:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
    },how:{
        type:Sequelize.DataTypes.STRING,
        allowNull:false,
    },
},{ timestamps: false })

sequelize.authenticate()
    .then((result) => {
        console.log('connected');
    }).catch((err) => {
        console.log(err);
    });

module.exports = mds
