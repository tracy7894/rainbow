var express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();

const StudentUserModel=require('../data/StudentUser') //學生
const ExternalUserModel=require('../data/ExternalUser') //校外

let checkLogin=require('../middleware/checkLogin');
const { group } = require('console');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'welcome' });
});
router.get('/index',checkLogin, (req, res,next)=> {
    console.log(req.session.username)
    res.render('index',{ title: req.session.groupId });
});

router.get('/login', (req, res) => {
  if (req.session.username) {
    res.redirect('/index');
  } else {
    res.render('login');
  }
});

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
  StudentUserModel.findOne({ username: username, password: password })
  .then(student => {
    if (student) {

      req.session.username = student.username;
      req.session.groupId = student.groupId;
      return res.render('success', { msg: "welcome " + student.username, url: '/index' });
    } else {
      // 如果沒有找到學生，查詢外部使用者
      return ExternalUserModel.findOne({ username: username, password: password });
    }
  })
  .then(externalUser => {
    // 如果外部使用者存在
    if (externalUser) {
      req.session.username = externalUser.username;
      return res.render('success', { msg: "welcome " + externalUser.username, url: '/index' });
    } else {
      // 如果沒有找到任何使用者，返回登錄失敗
      if (!res.headersSent) {
        return res.status(400).send('登錄失敗');
      }
    }
  })
  .catch(err => {
    if (!res.headersSent) {
      return res.status(500).send('error');
    }
    console.error('Login error:', err);
  });
});
router.get('/logout',(req,res)=>{
  req.session.destroy(()=>{
    res.render('success',{msg:'登出成功',url:'/login'})
  })
})

router.get('/chat',checkLogin,(req, res) => {
  if(!req.session.groupId){
     return res.send("尚未分組")
  }
  res.render('chat', { username: req.session.username ,groupId:req.session.groupId});
  
});

router.get('/identity', function(req, res) {
  res.render('identity');  
});

router.get('/setgroup',(req,res)=>{
    res.render('setgroup')
})

router.post('/setgroup',(req,res)=>{
  const { username, groupId } = req.body;
  StudentUserModel.findOneAndUpdate({ username: username }, { groupId: groupId }, { new: true })
  .then(student => {
      if (!student) {
          return res.status(404).json({ message: "未找到該學生" });
      }

      // 更新成功後的反饋
      return res.render('success', { msg: `${student.username} 已分配至 Group ${groupId}`, url: '/setgroup' });
  })
  .catch(err => {
      console.error('更新學生組別時出錯:', err);
      return res.status(500).json({ message: "伺服器錯誤，請稍後再試" });
  });
})

module.exports = router;
