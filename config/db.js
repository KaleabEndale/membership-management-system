const Sequelize = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize('mmsDatabase',process.env.DB_USERNAME,process.env.DB_PASSWORD,{
    dialect:'mysql',
    host:'localhost',
    logging:false
})

module.exports = sequelize