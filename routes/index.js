var express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();

const StudentUserModel=require('../data/StudentUser') //學生
const ExternalUserModel=require('../data/ExternalUser') //校外
const MaterialsDataModel=require('../data/MaterialsData') //教  材
const DocumentDataModel=require('../data/documentData')//寶典
let checkLogin=require('../middleware/checkLogin');
const { group } = require('console');
const path = require('path');


app.set('views', path.join(__dirname, 'views'));

router.get('/', function(req, res, next) {
  res.render('index', { title: 'welcome' });
});
router.get('/index',checkLogin, (req, res,next)=> {
    console.log(req.session.username)
  //  console.log("id="+req.session.groupId)
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
      req.session.identity = student.identity || 'student';
      req.session.userId=student.id;
      console.log("id="+req.session.userId);

      return res.json({ success: true, message: "welcome " + student.username, redirectUrl: '/index' });
    }

    // 查找校外人士
    const externalUser = await ExternalUserModel.findOne({ username, password });
    if (externalUser) {
      req.session.username = externalUser.username;
      req.session.groupId = externalUser.groupId;
      req.session.identity = externalUser.identity || 'external'; 
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

  console.log("id="+req.session.groupId)
  console.log("identity="+req.session.identity)
  if(!req.session.groupId){
     return res.send("尚未分組")
  }
  
  res.render('chat', { username: req.session.username ,groupId:req.session.groupId,identity:req.session.identity});
  
});
router.get('/publicRoom',checkLogin,(req, res) => {

  console.log("id="+req.session.groupId)
  res.render('publicRoom', { username: req.session.username ,groupId:"publicRoom",identity:req.session.identity});
  
});

router.get('/identity', function(req, res) {
  res.render('identity');  
});

router.get('/setgroup',checkLogin,(req,res)=>{
  res.sendFile(path.join(__dirname, '../views/setgroup.html'));
})

router.put('/api/update-group', async (req, res) => {
  const { courseType, userIds, groupId } = req.body;
  const model = courseType === 'internal' ? StudentUserModel : ExternalUserModel;

  try {
      // 更新使用者的 groupId
      await model.updateMany(
          { _id: { $in: userIds } },
          { $set: { groupId } } // 設置正確的組別 ID
      );
      res.json({ message: '分組成功' });
  } catch (error) {
      console.error('分組失敗:', error);
      res.status(500).json({ message: '分組失敗' });
  }
});



router.get('/api/groups', async (req, res) => {
  const { courseType } = req.query;
  const model = courseType === 'internal' ? StudentUserModel : ExternalUserModel;

  try {
      const groups = await model.aggregate([
          { $match: { access: true } },  //only access
          { $group: { _id: "$groupId", members: { $push: "$name" } } }, // 每組的成員名稱
          { $sort: { _id: 1 } } // 根據組別 ID 排序
      ]);

      res.json({ groups }); 
  } catch (error) {
      console.error('獲取組別失敗:', error);
      res.status(500).json({ message: '獲取組別失敗' });
  }
});


// 查詢已認證用戶
router.get('/api/students', async (req, res) => {
  const { courseType, name } = req.query;
  const model = courseType === 'internal' ? StudentUserModel : ExternalUserModel;

  try {
      const students = await model.find({
          access: true, // 只查詢 access 為 true 的使用者
          name: { $regex: name || '', $options: 'i' } // 根據姓名模糊搜尋
      });
      res.json({ students });
  } catch (error) {
      res.status(500).json({ message: '查詢學生失敗' });
  }
});





router.get('/studentList',checkLogin, async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../views/studentList.html'));
  } catch (error) {
    console.error('取得學生列表時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
  
});


router.get('/api/accessed_users', async (req, res) => {
  try {
    const { class: classFilter, name, username, gradeLevel, academicYear, groupId } = req.query;
    const filter = { access: true };  // 只查詢已認證的用戶

    if (classFilter) {
      filter.class = classFilter; // 根據班級篩選
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // 根據姓名篩選
    }

    if (username) {
      filter.username = { $regex: username, $options: 'i' }; // 根據學號篩選
    }

    if (gradeLevel) {
      filter.gradeLevel = gradeLevel; // 根據年級篩選
    }

    if (academicYear) {
      filter.academicYear = academicYear; // 根據學年篩選
    }

    if (groupId) {
      filter.groupId = groupId; // 根據組別篩選
    }

    // 查詢所有班級名稱
    const allClasses = await StudentUserModel.distinct('class');
    const externalClasses = await ExternalUserModel.distinct('class');
    const uniqueClasses = [...new Set([...allClasses, ...externalClasses])];  // 合併並去重

    // 查詢所有組別
    const allGroups = await StudentUserModel.distinct('groupId');
    const externalGroups = await ExternalUserModel.distinct('groupId');
    const uniqueGroups = [...new Set([...allGroups, ...externalGroups])];  // 合併並去重

    // 查詢已認證的學生用戶和外部用戶
    const studentUsers = await StudentUserModel.find(filter, 'name class groupId');
    const externalUsers = await ExternalUserModel.find(filter, 'name class groupId');

    // 合併兩個用戶的結果
    const allUsers = [...studentUsers, ...externalUsers];

    res.json({ allUsers, uniqueClasses, uniqueGroups }); // 返回用戶資料和班級、組別列表
  } catch (error) {
    console.error('取得用戶資料時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});



router.get('/consent', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../views/consent.html'));
    } catch (error) {
        console.error('取得認證頁面時發生錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

router.get('/api/users', async (req, res) => {
  try {
      const { type, name, username, class: classFilter, gradeLevel, academicYear, groupId } = req.query;
      
      // 查詢學生或校外人士
      const filters = { access: false }; // 只查詢未認證的

      if (name) filters.name = new RegExp(name, 'i'); // 支援模糊查詢
      if (username) filters.username = new RegExp(username, 'i');

      let UserModel;
      if (!type || !['student', 'external'].includes(type)) {
        return res.status(400).json({ message: '請提供有效的用戶類型 (student 或 external)' });
      }
      else if (type === 'student') {
          UserModel = StudentUserModel;
          if (classFilter) filters.class = classFilter;
          if (gradeLevel) filters.gradeLevel = gradeLevel;
          if (academicYear) filters.academicYear = academicYear;
          if (groupId) filters.groupId = groupId;
      } else if (type === 'external') {
          UserModel = ExternalUserModel;
      } else {
          return res.status(400).json({ message: '請提供有效的用戶類型 (student 或 external)' });
      }

      const users = await UserModel.find(filters);
      res.json(users);
  } catch (error) {
      console.error('查詢用戶資料時發生錯誤:', error);
      res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});

router.put('/api/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { type } = req.query;

      if (!type || !['student', 'external'].includes(type)) {
          return res.status(400).json({ message: '請提供有效的用戶類型 (student 或 external)' });
      }

      let UserModel;
      if (type === 'student') {
          UserModel = StudentUserModel;
      } else if (type === 'external') {
          UserModel = ExternalUserModel;
      }
      // 更新用戶的 access 欄位
      const user = await UserModel.findByIdAndUpdate(id, { access: true }, { new: true });

      if (!user) {
          return res.status(404).json({ message: '用戶不存在' });
      }

      res.json({ message: '用戶已成功認證', user });
  } catch (error) {
      console.error('認證用戶時發生錯誤:', error);
      res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});


router.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  try {
      const UserModel = getUserModel(type);
      const user = await UserModel.findByIdAndUpdate(id, { access: true }, { new: true });
      if (!user) return res.status(404).json({ message: '用戶不存在' });
      res.json({ message: '用戶已認證', user });
  } catch (error) {
      console.error('用戶更新失敗:', error);
      res.status(500).json({ message: '伺服器錯誤' });
  }
});
router.delete('/api/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { type } = req.query;

      if (!type || !['student', 'external'].includes(type)) {
          return res.status(400).json({ message: '請提供有效的用戶類型 (student 或 external)' });
      }

      let UserModel;
      if (type === 'student') {
          UserModel = StudentUserModel;
      } else if (type === 'external') {
          UserModel = ExternalUserModel;
      }
      console.log("name="+req.session.username)
      console.log("id="+id)
      // 從資料庫刪除用戶
      const user = await UserModel.findByIdAndDelete(id);

      if (!user) {
          return res.status(404).json({ message: '用戶不存在' });
      }
      if (req.session.userId === id) {
        req.session.destroy(err => {
            if (err) {
                console.error('銷毀 session 時發生錯誤:', err);
                return res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
            }
            console.log(`用戶 ${id} 的 session 已刪除`);
        });
      }
      res.json({ message: '用戶已被拒絕並刪除' });
  } catch (error) {
      console.error('拒絕用戶時發生錯誤:', error);
      res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
  }
});
//寶典
router.get('/documents', async (req, res) => {
  res.sendFile(path.join(__dirname, '../views/documents.html'));
});
router.get('/api/documents', async (req, res) => {
  const documents = await DocumentDataModel.find();
  res.json(documents);
});
// 更新文本
router.put('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const updateData = {};
  if (title) updateData.title = title; // 更新標題
  if (content) updateData.content = content; // 更新內容

  const document = await DocumentDataModel.findByIdAndUpdate(id, updateData, { new: true });
  res.json(document);
});


// 新增文本
router.post('/api/documents', async (req, res) => {
  const { title, content } = req.body;
  const document = new DocumentDataModel({ title, content});
  await document.save();
  res.json(document);
});

// 刪除文本
router.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  await DocumentDataModel.findByIdAndDelete(id);
  res.json({ message: '文本已刪除' });
});

module.exports = router;
