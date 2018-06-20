const express=require('express');
const Customer=require('./models/Customer');
const Transfer=require('./models/Transfer');
const router=express.Router();

router.get('/login',(req,res)=>{
    res.render('customer/login',{
        error:''
    });
});

router.get('/register',(req,res)=>{
    res.render('customer/register',{
        error:''
    });
})


router.post('/login',(req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    
    Customer.findOne({email,password},(err,customer)=>{
        if(err) throw err;
        if(customer){
            req.session.customer=customer._id;
            req.session.save();
            res.redirect('/customer/home/');
        }
        else{
            res.render('customer/login',{
                error:'Invalid Login details'
            })
        }
    })

})

router.post('/register',(req,res)=>{
    let names=req.body.names;
    let email=req.body.email;
    let password=req.body.password;
    let repeat=req.body.repeat;

    if(password!=repeat){
        res.render('customer/register',{
            error:'Passwords must Match'
        })
    }
    else{
        Customer.findOne({email},(err,customer)=>{
            if(err) throw err;
            if(customer){
                res.render('customer/register',{
                    error:'Email already exists'
                })
            }
            else{
                Customer.create({
                    names,
                    email,
                    password
                },(err,data)=>{
                    req.session.customer=data._id;
                    req.session.save();
                    res.redirect('/customer/home/');
                });
            }
        })
    }
});

router.get('/home',(req,res)=>{
    if(req.session.customer){
        Customer.findById(req.session.customer,(err,customer)=>{
            if(err) throw err;
            Customer.find({},(err,customers)=>{
                if(err) throw err;
                res.render('customer/home',{
                    me:customer,
                    customers
                });
            })
            
        });
    }
    else{
       res.render('customer/login',{
           error:'You need to Login First'
       });
    }
});

router.get('/transfer/:to',(req,res)=>{
    if(req.session.customer){
        let to=req.params.to;
        let from=req.session.customer;
        Customer.findById(to,(err,customer)=>{
            if(err) throw err;
            if(customer){
                Customer.findById(from,(err,me)=>{
                    if(err) throw err;
                    res.render('customer/transfer',{
                        customer,
                        me
                    });
                })
                
            }
            else{
                res.send('Invalid User to transfer amounts');
            }
        });
    }
    else{
        res.render('customer/login',{
            error:'You must Login First'
        });
    }
});

router.post('/transfer/:to',(req,res)=>{
    if(req.session.customer){
        let to=req.params.to;
        let from=req.session.customer;
        let amount=req.body.amount;

        Customer.findById(from,(err,customer)=>{
            if(err) throw err;
            if(customer.amount<parseInt(amount)){
                res.send('You must have enough money to send...');
            }
            else{
                customer.amount-=parseInt(amount);
                customer.save();

                Customer.findById(to,(err,receiver)=>{
                    if(err) throw err;
                    receiver.amount+=parseInt(amount);
                    receiver.save();
                    Transfer.create({
                        from,
                        to,
                        amount
                    });
                    res.redirect('/customer/home/');
                })
            }
        })
    }
});

router.get('/logout',(req,res)=>{
    req.session.customer=null;
    res.redirect('/');
})

router.delete('/:customer',(req,res)=>{
    let id=req.params.customer;
    Customer.findByIdAndRemove(id,(err)=>{
        if(err) throw err;
        res.json({
            message:'Deleted'
        })
    })
})
module.exports=router;