// Require dependencies
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const session=require('express-session');
const cookieParser=require('cookie-parser');
const app=express();

mongoose.connect('mongodb://localhost/savetransfer');
const db=mongoose.connection;

db.once('open',()=>{
    console.log('Connected to the Database');
})

// Middlewares...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({secret:'mysecret',saveUninitialized:true,resave:true}));
app.use(cookieParser());
app.use('/static',express.static('public'));
app.set('view engine','ejs');


//Routes initialization...
app.use('/api',require('./api'));
app.use('/agent',require('./agent'));
app.use('/customer',require('./customer'));
app.get('/',(req,res)=>{
    res.render('index');
});
app.get('*',(req,res)=>{
    res.json({error:'404 Not Found'});
});


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});