var express = require('express');
var router = express.Router();
const userModel=require('../data/user')
const md5=require('md5')
let checkLogin=require('../middleware/checkLogin')
router.get('/', function(req, res, next) {
  res.render('index', { title: 'welcome' });
});
router.get('/index',checkLogin, (req, res,next)=> {
    res.render('index',{ title: req.session.username });
});
router.get('/login',(req,res)=>{

  res.render('login')
})
router.get('/reg',(req,res)=>{

  res.render('reg')
})
router.post('/reg',(req,res)=>{
  userModel.create({...req.body})
  .then(data=>{
    res.render('success',{msg:'註冊成功',url:'/login'})
  })
  .catch(err=>{
    res.status(500).send('失敗')
  })
})
router.post('/login',(req,res)=>{
  let {username,password}=req.body
  userModel.findOne({username:username,password:password})
  .then(data=>{
    if(!data){
      res.send('登錄失敗')
    }
    else{
      req.session.username=data.username
      res.render('success',{msg:username,url:'/index'})
    }
  })
    .catch(err=>{
      res.status(500).send('error')
    })
  
})
router.get('/logout',(req,res)=>{
  req.session.destroy(()=>{
    res.render('success',{msg:'登出成功',url:'/login'})
  })
  
})


module.exports = router;
