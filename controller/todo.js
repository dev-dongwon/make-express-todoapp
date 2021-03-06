const view = require('../utils/viewResolver');
const csvParser = require('../utils/csv-parser');
const fileHandler = require('../utils/file-system');

const getPage = () => async (req, res, next) => {
  if (!req.session || req.session === 'false') {
    res.writeHead(302, {'Location': '/' });
    res.end();
    return;
  }
  
  const userID = req.session.userID;
  const viewer = await view(userID, 'index.html');

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(viewer);
}

const updateTodoKey = async (keyObj, path) => {
  keyObj.cardKey++;
  const csvData = csvParser.keyObjToCsvStr(keyObj);
  await fileHandler.writeFile(path, csvData);
}

const addTodo = () => async (req, res, next) => {
  const {data, type} = req.body;
  const userID = req.session.userID;
  let keyObj = await csvParser.getKeyValue('./db/keys.csv');
  const cardKey = keyObj.cardKey;
  
  const dataStr = `\n${cardKey},${type},${data},${userID}`;

  await fileHandler.appendFile('./db/todoList.csv', dataStr);
  await updateTodoKey(keyObj, './db/keys.csv');

  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end(cardKey);
}

const deleteTodo = () => async (req, res, next) => {
  const cardNo = req.url.split('/')[2];
  const allTodoData = await csvParser.getKeyValueObj('./db/todoList.csv');
  delete allTodoData[cardNo];

  const dataStr = Object.keys(allTodoData).reduce((acc, key) => {
    const data = allTodoData[key];
    const string = `${key},${data['type']},${data['content']},${data['userID']}`;
    acc += `\n${string}`;
    return acc;
  },`cardNo,type,content,userID`);

  await fileHandler.writeFile('./db/todoList.csv', dataStr);

  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end('success');
}

const updateTodo = () => async (req, res, next) => {
  const cardNo = req.url.split('/')[2];
  const {type} = req.body;

  const allTodoData = await csvParser.getKeyValueObj('./db/todoList.csv');
  allTodoData[cardNo]['type'] = type;

  const dataStr = Object.keys(allTodoData).reduce((acc, key) => {
    const data = allTodoData[key];
    const string = `${key},${data['type']},${data['content']},${data['userID']}`;
    acc += `\n${string}`;
    return acc;
  },`cardNo,type,content,userID`);

  await fileHandler.writeFile('./db/todoList.csv', dataStr);

  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end('success');
}

const updateCardSequence = () => async (req, res, next) => {
  const sequenceObj = (req.body);
  const userID = req.session.userID;
  
  const allSequence = await csvParser.getKeyValueObj('./db/todo-sequence.csv');
  allSequence[userID] = sequenceObj;

  const dataStr = Object.keys(allSequence).reduce((acc, key) => {
    const data = allSequence[key];
    const string = `${key},${data['todo']},${data['doing']},${data['done']}`;
    acc += `\n${string}`;
    return acc;
  },`id,todo,doing,done`);

  await fileHandler.writeFile('./db/todo-sequence.csv', dataStr);

  res.writeHead(200, {'Content-Type' : 'text/plain'});
  res.end('success');
}

module.exports = {
  getPage,
  addTodo,
  deleteTodo,
  updateTodo,
  updateCardSequence
}