





exports.getstaff = (req,res)=>{
    res.render('staff')
}

exports.getstaffforgotpassword = (req,res)=>{
    res.render('sfp')
}

exports.stafflogout = (req,res)=>{
    res.clearCookie('token')
    res.render('staff')
}

exports.getstaffaddmember = (req,res)=>{
    res.render('addmember')
}

exports.getstaffviewmember = (req,res)=>{
    res.render('viewmember')
}

exports.getstaffeditmember = (req,res)=>{
    res.render('findmember')
}

exports.getstaffdeletemember = (req,res)=>{
    res.render('deletemember')
}

exports.pfm = (req,res)=>{
    res.render('pfm',{showButton:false})
}
