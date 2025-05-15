const actlogs = require('../model/actlogdb')


 async function logs (username,action,detail,ip) {
    const date = new Date().toLocaleString()
    actlogs.sync()
    .then(()=>{
        return actlogs.create({username:username,action:action,date:date,detail:detail,ip:ip})
    })
}

module.exports = logs