const express=require('express');
const Agent=require('./models/Agent');
const Customer=require('./models/Customer');
const Deposit=require('./models/Deposit');
const Transfer=require('./models/Transfer');
const router=express.Router();

router.get('/',(req,res)=>{
    res.json({
        message:'Hello world!!'
    })
})

router.post('/agent/login',(req,res)=>{
   let email=req.body.email;
   let password=req.body.password;
   Agent.findOne({email,password},(err,agent)=>{
       if(err) throw err;
       if(agent) 
       res.json({
           message:'Logged In',
           token:agent._id
       });
       else{
           res.json({
               message:'Not found'
           })
       }
   });
});

router.post('/customer/login',(req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    Customer.findOne({email,password},(err,customer)=>{
        if(err) throw err;
        if(customer){
            res.json({
                message:'Logged In',
                token:customer._id
            });
        }
        else{
            res.json({
                message:'Not found'
            })
        }
    });
});

router.post('/agent/register',(req,res)=>{
    let names=req.body.names;
    let email=req.body.email;
    let password=req.body.password;
    let repeat=req.body.repeat;
    
    if(password!=repeat){
        res.json({
            error:'Passwords must match...'
        })
    }
    else{
        Agent.findOne({email},(err,agent)=>{
            if(err) throw err;
            if(agent)
            res.json({
                error:'Agent already exists'
            });
            else{
                Agent.create({
                    names,
                    email,
                    password
                });
                res.json({
                    success:'Account created'
                });
            }
        });
    }
    
});

router.post('/customer/register',(req,res)=>{
    let names=req.body.names;
    let email=req.body.email;
    let password=req.body.password;
    let repeat=req.body.repeat;

    if(password!=repeat){
        res.json({
            error:'Passwords must match'
        });
    }
    else{
        Customer.findOne({email},(err,customer)=>{
            if(err) throw err;
            if(customer){
                res.json({
                    error:'Customer already exists'
                });
            }
            else{
                Customer.create({
                    names,
                    email,
                    password
                });
                res.json({
                    success:'Account created'
                });
            }
        });
    }
});

router.get('/agents',(req,res)=>{
    Agent.find({},(err,agents)=>{
        if(err) throw err;
        res.json(agents);
    });
});

router.get('/agents/:id',(req,res)=>{
    let id=req.params.id;
    Agent.findById(id,(err,agent)=>{
        if(err) res.json({
            error:'Not found'
        });
        res.json(agent);
    });
});


router.get('/customers',(req,res)=>{
    Customer.find({},(err,customers)=>{
        if(err) throw err;
        res.json(customers);
    });
});

router.get('/customers/:id',(req,res)=>{
    let id=req.params.id;
    Customer.findById(id,(err,customer)=>{
        if(err) res.json({
            error:'Not found'
        })
        res.json(customer);
    });
});


router.post('/transfer/:to',(req,res)=>{
    let from=req.headers.authorization;
    let to=req.params.to;
    let amount=req.body.amount;
    Customer.findById(from,(err,customer)=>{
        if(err)
        res.json({
            error:'Unauthorized'
        });
        else{
            customer.amount-=parseInt(amount);
            customer.save();
            Customer.findById(to,(err,recipient)=>{
                if(err){
                    customer.amount+=parseInt(amount);
                    customer.save();
                    res.json({
                        error:'Sorry for Unexpected error!!'
                    });
                }
                if(recipient){
                    recipient.amount+=parseInt(amount);
                    recipient.save();
                    let newTransfer=new Transfer({
                        from:from,
                        to:to,
                        amount:amount
                    });
                    newTransfer.save();
                    res.json({
                        success:'Transfer successful!!'
                    })
                }
            })
        }
    })
})


router.post('/agent/saveamount/:customer',(req,res)=>{
    let id=req.headers.authorization;
    let customerId=req.params.customer;
    let amount=req.body.amount;
    Agent.findById(id,(err,agent)=>{
        if(err){
            res.json({
                error:'Unauthorized'
            });
        }
        if(agent){
            Customer.findById(customerId,(err,customer)=>{
                if(err){
                    res.json({
                        error:'Customer not found'
                    })
                }

                if(customer){
                    customer.amount+=parseInt(amount);
                    customer.save();
                    let newDeposit=new Deposit({
                        customer:customerId,
                        agent:id,
                        amount:amount
                    });
                    newDeposit.save();
                    res.json({
                        success:'Transaction successful!!',
                        amount:amount
                    })
                }
            })
        }
    })
})

router.get('/deposits',(req,res)=>{
    Deposit.find({},(err,deposits)=>{
        if(err) throw err;
        res.json(deposits);
    });
});

router.get('/transfers',(req,res)=>{
    Transfer.find({},(err,transfers)=>{
        if(err) throw err;
        res.json(transfers);
    });
});
module.exports=router;