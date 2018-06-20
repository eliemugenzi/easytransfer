const express=require('express');
const router=express.Router();
const Agent=require('./models/Agent');
const Customer=require('./models/Customer');
const Deposit=require('./models/Deposit');
router.get('/login',(req,res)=>{
    res.render('agent/login',{
        error:''
    });
})

router.get('/register',(req,res)=>{
    res.render('agent/register',{
        error:''
    });
})

router.post('/login',(req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    
    Agent.findOne({email,password},(err,agent)=>{
        if(err) throw err;
        if(agent){
            req.session.agent=agent._id;
            req.session.save();
            res.redirect('/agent/home/');
        }
        else{
            res.render('agent/login',{
                error:'Invalid Login details'
            })
        }
    })
    
});

router.post('/register',(req,res)=>{
    let names=req.body.names;
    let email=req.body.email;
    let password=req.body.password;
    let repeat=req.body.repeat;

    if(password!=repeat){
        res.render('agent/register',{
            error:'Passwords must match'
        })
    }
    else{
        Agent.findOne({email},(err,agent)=>{
            if(err) throw err;
            if(agent){
                res.render('agent/register',{
                    error:'Email already exists'
                })
            }
            else{
                Agent.create({
                    names,
                    email,
                    password
                },(err,data)=>{
                    req.session.agent=data._id;
                    req.session.save();
                });
                res.redirect('/agent/home/');
            }
        })
        
    }
})


router.get('/home',(req,res)=>{
    if(req.session.agent){
        Customer.find({},(err,customers)=>{
            if(err) throw err;
            Agent.findById(req.session.agent,(err,me)=>{
                if(err) throw err;
                res.render('agent/home',{
                    customers:customers,
                    me
                });
            })
            
        });
    }
    else{
        res.render('agent/login',{
            error:'You need to Login First '
        })
    }
})

router.get('/saveamount/:customer',(req,res)=>{
    let customerId=req.params.customer;
    Customer.findById(customerId,(err,customer)=>{
        if(err) throw err;
        if(customer){
            Agent.findById(req.session.agent,(err,agent)=>{
                if(err) throw err;
                res.render('agent/deposit',{
                    customer,
                    me:agent
                });
            })
            
        }
        else{
            res.send('Invalid User');
        }
    });
});

router.post('/saveamount/:customer',(req,res)=>{
    let customerId=req.params.customer;
    let amount=req.body.amount;

    Customer.findById(customerId,(err,customer)=>{
        if(err) throw err;
        customer.amount+=parseInt(amount);
        customer.save();
    });
    
    Deposit.create({
        customer:customerId,
        agent:req.session.agent,
        amount
    });

    res.redirect('/agent/home/');

});


router.get('/logout',(req,res)=>{
    req.session.agent=null;
    res.redirect('/');
})

module.exports=router;
