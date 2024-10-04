var express = require('express');
//
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//
var router = express.Router();
const StudentUserModel=require('../data/StudentUser') //學生
const ExternalUserModel=require('../data/ExternalUser') //校外
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

router.get('/reg_student',(req,res)=>{
  res.render('reg_student')
})

router.post('/reg_student',(req,res)=>{
  StudentUserModel.create({...req.body})
  .then(data=>{
    res.render('success',{msg:'註冊成功',url:'/login'})
  })
  .catch(err=>{
    res.status(500).send('失敗')
  })
})

router.get('/reg_external',(req,res)=>{
  res.render('reg_external')
})

router.post('/reg_external',(req,res)=>{
  ExternalUserModel.create({...req.body})
  .then(data=>{
    res.render('success',{msg:'註冊成功',url:'/login'})
  })
  .catch(err=>{
    res.status(500).send('失敗')
  })
})

router.post('/login',(req,res)=>{
  let {username,password}=req.body
  StudentUserModel.findOne({username:username,password:password})
    .then(data => {
      if (data) {
          req.session.username = data.username;
          return res.render('success', { msg: "welcome " + username, url: '/index' });
      } else {
          return ExternalUserModel.findOne({ username: username, password: password });
      }
  })
  .then(data => {
      if (data) {
          req.session.username = data.username;
          res.render('success', { msg: "welcome " + username, url: '/index' });
      } else {
          res.send('登錄失敗');
      }
  })
  .catch(err => {
      res.status(500).send('error');
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy(()=>{
    res.render('success',{msg:'登出成功',url:'/login'})
  })
  

})


router.get('/chat',(req, res)=>{
  res.render('chat');
});
router.get('/identity', function(req, res) {
  res.render('identity');  
});


    

module.exports = router;
