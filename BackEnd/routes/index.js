import express from "express";
import {
    getUser,
    updateUser,
    Register,
    Login,
    Logout,
    addOrDelFavorite,
    checkFavorite,
    getChat,
    getInboxList,
    readChat,
    sendChat
} from "../controllers/Users.js";
import {
    addField,
    getField,
    getCategories,
    setCategories,
    getCity,
    filterCity,
    getlistField,
    getProvince,
    setLocal,
    setPrice,
    filterProvince,
    listFavorite,
    fieldFinder,
    favoriteFinder
} from "../controllers/Field.js";
import { getmethodPayment, saldo } from "../controllers/Payment.js"
import { addNewOrder, allTransaction, deleteOrder, detailOrder, editOrder, fieldList, getOrder, getRemaining, getScheduleById, listOrderFields, orderDelete, orderList, orderPendingList, paymentOrder } from "../controllers/Order.js"
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import passport from "passport";
import { GoogleLogin } from "../middleware/GoogleLogin.js";

const connectedUsers = [];

const addUser = (user, idSocket) =>{
  if(user !== null && idSocket !== null){
      if(connectedUsers.some(exist=>exist.user === user)){
          const index = connectedUsers.findIndex(exist=>exist.user === user);
          connectedUsers[index].id = idSocket;
      }else{
          connectedUsers.push({id:idSocket, user:user});
      }
      console.log(connectedUsers);
  }
}

const logoutUser = (user) =>{
  const index = connectedUsers.findIndex(exist=>exist.user === user);
  if(index >=0)connectedUsers.splice(index, 1);
}

const setRouter = (io) =>{

  const router = express.Router();
  // Account
  router.post('/user', verifyToken, getUser);
  router.post('/user/update',verifyToken, updateUser);
  router.post('/register', Register(addUser));
  router.post('/login', Login(addUser));
  router.post('/token', refreshToken(addUser));
  router.delete('/logout', Logout(logoutUser));
  router.post('/chat', verifyToken, getChat(io, connectedUsers));
  router.post('/chat/read', verifyToken, readChat(io, connectedUsers));
  router.post('/inbox', verifyToken, getInboxList);
  router.post('/chat/send', verifyToken, sendChat(io, connectedUsers));
  
  // Add Field
  router.post('/field/add', addField);
  
  // get Field
  router.post('/field/search', fieldFinder);
  router.get('/list-field', getlistField);
  router.post('/list-field/category', setCategories);
  router.post('/list-field/price/', setPrice);
  router.get('/list-field/local/:province/:city', setLocal);
  router.get('/all-categories', getCategories);
  router.get('/getcity', getCity);
  router.post('/getcity', filterCity);
  router.get('/getprovince', getProvince);
  router.post('/getprovince', filterProvince);
  router.get('/field/:id', getField);
  
  // get order
  router.get('/schedule/:id', getScheduleById);
  router.get('/payment/method', getmethodPayment)
  router.post('/order/list', verifyToken, getOrder);
  router.post('/order/add', verifyToken, addNewOrder);
  router.delete('/order/delete', verifyToken, deleteOrder);
  router.post('/order/edit', verifyToken, editOrder);
  router.post('/payment', paymentOrder);
  router.post('/getremaining', verifyToken, getRemaining);
  router.post('/ordered/detail', verifyToken, detailOrder);
  router.post('/favorite', verifyToken, addOrDelFavorite);
  router.post('/favorite/finder',verifyToken ,favoriteFinder)
  router.post('/favorite/list', verifyToken, listFavorite);
  router.post('/setfavorite', verifyToken, checkFavorite);
  router.post('/ordered/list', verifyToken, orderList);
  router.delete('/ordered/delete', verifyToken, orderDelete);
  router.post('/ordered/pending', verifyToken, orderPendingList);

  router.post('/owner/order/list', verifyToken, listOrderFields);
  router.post('/owner/order/transaction', verifyToken, allTransaction);
  router.post('/owner/field/list', verifyToken, fieldList);
  router.post('/saldo', verifyToken, saldo);
  
  router.get("/login/failed", (req, res) => {
    res.status(401).json({
      success: false,
      message: "failure",
    });
  });
  
  router.get("/auth/google", passport.authenticate("google", { scope: ["profile","email"] }));
  
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      assignProperty: 'user',
      failureRedirect: 'http://localhost:3000/signin',
    }), 
    GoogleLogin
  );
  return router
}

export default setRouter;