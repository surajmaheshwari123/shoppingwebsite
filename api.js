let express=require('express');
let cors=require('cors'); 
let bodyParser=require('body-parser'); 
let sha1=require('sha1');
var session = require('express-session')
let mongoose=require('mongoose');
let app=express();
app.use(cors());
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))
  mongoose.connect(process.env.MONGOD_URI || "mongodb+srv://mongodbuser:mongodb@cluster0-dktnn.mongodb.net/<dbname>?retryWrites=true&w=majority",{ useUnifiedTopology: true , useNewUrlParser: true });
let signupModel=require('./db/signup');
let promodel=require('./db/product')
let adminmodel=require('./db/admin')
let wishlistmodel=require('./db/wishlist')
let ordermodel=require('./db/order')
app.use(express.static('uploads'));
const multer=require('multer');
const PATH = './uploads';
app.use(express.static('uploads'));
const PORT=process.env.PORT || 2222;
let disDir=__dirname + "/dist/projest";
app.use(express.static(disDir));
if(process.env.NODE_ENV === 'production'){
    //set static folder
    app.use(express.static(disDir));
}
app.get('*',(req, res,next) => {
    res.sendFile(path.join(__dirname, 'dist', 'projest','index.html'));
});
var  userarray=[];
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    cb(null,  Date.now()+'-'+file.originalname)
  }
});
let upload = multer({
  storage: storage
}).single('Image');


// signup by form value

app.post('/api/signupbyform',(req,res)=>
{
    let ins=new signupModel({'name':req.body.name, 'email':req.body.email,'password':sha1(req.body.password)})
    ins.save((err)=>
    {
        if(err){
            res.json({'err':1,"msg":"Email OR Passwrod Does Not Exist"})
        }
        else{
            res.json({'err':0,'msg':'Data save','name':req.body.name,'email':req.body.email})
        }
    })
})

app.post("/api/loginbyform",(req,res)=>{
    let name=req.body.name
    let email=req.body.email
    let password=sha1(req.body.password)
  signupModel.find({'name':req.body.name,'email':req.body.email,'password':password},(err,data)=>
  {
      if (err) {
          console.log(err)
      }
      else if(data.length==0)
      {
          res.json({'err':1,'msg':'Please Fill Your Information Correctly'})
          console.log(err)
      }
      else
      {
          res.json({'err':0,'msg':'Login Success','name':name,'email':email});
      }
  })
})

app.post('/api/addproduct',(req,res)=>
{
  upload(req,res,(err)=>
    {
        if(err){
            res.json({'msg':'Uploading error'})
        }
        else
        {
            let ins=new promodel({'schoolname':req.body.sname,'bname':req.body.bname,'publication':req.body.pb,'isbn':req.body.isbn,'language':req.body.lng,'edition':req.body.edtn,'standard':req.body.stnd,'mrp':req.body.mrp,'discount':req.body.disc,'fname':req.file.filename});
            ins.save(err=>
             {
                 if(err)
                 {
                   res.json({'msg':'Error Occured'})
                   console.log(err)
                  }
                 else
                 {
                  res.json({'err':0,'msg':'Data Saved'})
                 }
             })
        }
    })
})
 
app.get('/api/allmembers',(req,res)=>
{
    signupModel.find({},(err,data)=>
    {
        if(err){}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})

app.post('/api/booksdata',(req,res)=>      
{
    promodel.find({'schoolname':req.body.name,'standard':req.body.class},(err,data)=>
    {
        if(err){res.json({'err':1,'msg':'erroroccured'})}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})

app.get('/api/deluserbyadmin/:pid',(req,res)=>
{
    let pid=req.params.pid;
    signupModel.deleteOne({_id:pid},(err)=>
    {
        if(err){console.log(err)}
        else 
        {
            res.json({'err':0,'msg':'product Deleted'});
        }
    })
})

app.post('/api/adminlogin',(req,res)=>
{
    let email=req.body.email;
    let pass=sha1(req.body.password);
    //     let ins=new adminmodel({'email':email,'password':pass});
    // ins.save((err)=>
    // {
    //     if(err){}
    //     else 
    //     {
    //         res.json({'err':0,'msg':'Data Saved'});
    //     }
    // })
    adminmodel.find({'email':email,'password':pass},(err,data)=>
    {
        if(err){}
        else if(data.length==0)
        {
            res.json({'err':1,'msg':'Email or pass is not correct'})
        }
        else 
        {
            res.json({'err':0,'msg':'Login Success','uid':email});
        }
    })
})
app.get('/api/getproduct',(req,res)=>      
{
    console.log(process.env.TEST);
    promodel.find({},(err,data)=>
    {  
        if(err){res.json({'err':1,'msg':'error occured'})}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})


app.get('/api/deladminproduct/:pid',(req,res)=>
{
    let pid=req.params.pid
    promodel.deleteOne({_id:pid},(err)=>
    {
        if(err){}
        else 
        {
            res.json({'err':0,'msg':'producted Deleted'});
        }
    })
})

app.get('/api/countmembers',(req,res)=>{
    signupModel.countDocuments({}, function( err, count){
        if(err){res.json({'err':1,'msg':'error occured'})}
        else{
            res.json({'err':0,'value':count})
        }
    })
})

app.post('/api/sessioncartdata',(req,res)=>{  // home aur  viewproduct val wishlist
    var t = req.body.pcart;
    var uid=req.body.uid;
    console.log(uid)
    wishlistmodel.findOne({userwishlistname:uid}).then(function(result){
        if(result !== undefined && result !== null )
        {
            result.prodid=t;
            result.save();
        }
        else{
           var mywishlistmodel =new wishlistmodel({
                userwishlistname:uid,
                prodid:t
            });
            mywishlistmodel.save();

        }
    })
})

app.post('/api/usercartitems/',(req,res)=>{    //wishlist vale product show krane ke liye 
    var uid=req.body.uid;
    var arrwishlist=[];
    wishlistmodel.findOne({userwishlistname:uid}).then(function(result){
        if(result !== undefined && result !== null )
        {
           
            arrOfVals= JSON.parse(result.prodid); 
            for (i=0;i<arrOfVals.length;i++)
            {
                arrwishlist.push(arrOfVals[i]);
            }
            promodel.find({_id:{$in:arrwishlist}},(err,data)=>{
                if(err){
                    console.log(err)
                    res.json({'err':1,'msg':'error occured'})
            }
                else{
                    res.json({'err':0,'pdata':data})
                }
            })   
        }
    })
})

app.post('/api/delwishlistproduct',(req,res)=>
{
    console.log(req.body)
    wishlistmodel.findOne({userwishlistname:req.body.uid},(err,data)=>
    {
        if(err){console.log(err)}
        else 
        {
            var t=JSON.parse(data.prodid);
            for(i=0;i<Object.keys(t).length;i++) {
                if(t[i] == req.body.idd)
                {
                    delete t[i];
                }
            }
            data.prodid=JSON.stringify(t);
            data.save();
        }
    })
})

app.post('/api/userorderitems/',(req,res)=>{ 
   //wishlist pe place order pe chal rahi hai
   ocartobject={}
   var s=JSON.parse(req.body.meremahnat)
    var t= JSON.parse(req.body.ocart) 
    var arrOfVals = [];
for(i=0;i<t.length;i++) {
  arrOfVals.push(t[i]);
}
var metaobj={};
  promodel.find({_id:{$in:arrOfVals} },(err,data)=>{
      if(err){
          console.log(err)
          res.json({'err':1,'msg':'error occured'})
  }
      else{
        for (var i=0;i<data.length;i++)
        {
            for( var j=0;j<Object.keys(s).length;j++)
            {
                if(data[i]._id==Object.keys(s)[j])
                {
                    var quantity=s[Object.keys(s)[j]];
                    if(metaobj[data[i].bname] !== undefined)
                    {
                        metaobj[data[i].bname]=quantity+1;
                    }
                    else
                    {
                    metaobj[data[i].bname]=quantity
                    }
                    console.log(metaobj)
                }
            }
        }
          res.json({'err':0,'pdata':data,itemquantity:metaobj})
      }
  }) 


})

app.post('/api/changepassword',(req,res)=>{
    let nid=req.body.nid;
    let op=sha1(req.body.op);
    let np=sha1(req.body.np);
    signupModel.findOne({'name':nid},(err,data)=>
    {
        if(err){}
        else {
            console.log(data)
             if(op==data.password)
             {
                 if(op==np)
                 {
                    res.json({'err':1,'msg':'Op and cp is not same'});
                 }
                 else 
                 {
                     signupModel.updateOne({'name':nid},{$set:{'password':np}},(err)=>
                     {
                         if(err){}
                         else 
                         {
                             res.json({'err':0,'msg':'password changed'});
                         }
                     })
                 }
             }
             else 
             {
                 res.json({'err':1,'msg':'Op is not correct'});
             }
        }
    })
})

app.post('/api/adminorders',(req,res)=>{ 
    console.log(req.body.mail)
    let costumername=req.body.uid
    let info=req.body.ffff
    let prodt=req.body.meremahnat
    let totalprice=req.body.displayprice
    let ins=new ordermodel({'username':costumername,'information':info,'products': prodt,'totalamount':totalprice});
    ins.save(err=>
     {
         if(err)
         {
           res.json({'msg':'Error Occured'})
           console.log(err)
          }
         else
         {
          res.json({'err':0,'msg':'Data Saved'})
          var nodemailer = require("nodemailer");
          nodemailer.createTransport('smtps://ujjwal.kansal99@gmail.com:ilikemusic@smtp.gmail.com');
          
          var smtpConfig = {
              host: 'smtp.gmail.com',
              port: 465,
              secure: true, // use SSL
              auth: {
                  user: 'ujjwal.kansal99@gmail.com',
                  pass: 'ilikemusic'
              }
          };
          
               
          var mailOptions = {
            from: 'ujjwal.kansal99@gmail.com',
            to: `${req.body.mail}`,
            subject: 'Product Confirmation Mail',
            text: 'Your Product is saved successfully currenly We are reviewing your product and as we approve your product we will email you! '
          };
          var transporter = nodemailer.createTransport(smtpConfig);
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log("-----error is------")
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
         }
     })

})

app.get('/api/getorders',(req,res)=>      
{
    ordermodel.find({},(err,data)=>
    {  
        if(err){res.json({'err':1,'msg':'error occured'})}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})
app.listen(PORT,()=>
{
    console.log("Works on 2222");
})