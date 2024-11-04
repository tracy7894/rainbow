var express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();

const StudentUserModel=require('../data/StudentUser') //學生
const ExternalUserModel=require('../data/ExternalUser') //校外
const MaterialsDataModel=require('../data/materialsData') //教  材

let checkLogin=require('../middleware/checkLogin');
const { group } = require('console');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));

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

router.post('/api/reg_student', async (req, res) => {
  try {
    await StudentUserModel.create({ ...req.body });
    res.json({ success: true, message: '註冊成功', redirectUrl: '/login' });
  } catch (error) {
    console.error('註冊失敗:', error);
    res.status(500).json({ success: false, message: '註冊失敗' });
  }
});

router.get('/reg_external',(req,res)=>{
  res.render('reg_external')
})

router.post('/api/reg_external', async (req, res) => {
  try {
    await ExternalUserModel.create({ ...req.body });
    res.json({ success: true, message: '註冊成功', redirectUrl: '/login' });
  } catch (error) {
    console.error('註冊失敗:', error);
    res.status(500).json({ success: false, message: '註冊失敗' });
  }
});

router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找學生
    const student = await StudentUserModel.findOne({ username, password });
    if (student) {
      req.session.username = student.username;
      req.session.groupId = student.groupId;
      return res.json({ success: true, message: "welcome " + student.username, redirectUrl: '/index' });
    }

    // 查找校外人士
    const externalUser = await ExternalUserModel.findOne({ username, password });
    if (externalUser) {
      req.session.username = externalUser.username;
      return res.json({ success: true, message: "welcome " + externalUser.username, redirectUrl: '/index' });
    }

    // 沒有找到任何用戶，返回失敗消息
    return res.status(400).json({ success: false, message: '登錄失敗' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: '伺服器錯誤，請稍後再試' });
  }
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

router.get('/studentList', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../views/studentList.html'));
  } catch (error) {
    console.error('取得學生列表時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
  
});
router.get('/api/students', async (req, res) => {
  try {
    const { class: classFilter, access } = req.query; // 獲取篩選條件
    const filter = {};

    if (classFilter) {
      filter.class = classFilter;
    }
    if (access) {
      filter.access = access === 'true';
    }

    const students = await StudentUserModel.find(filter, 'username class access'); 
    // 查詢時指定返回字段
    console.log(students);
    res.json(students); // 返回學生列表 JSON 格式
  } catch (error) {
    console.error('取得學生列表時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});



module.exports = router;


module.exports = router;
