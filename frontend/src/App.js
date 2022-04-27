import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from "./components/Header";
import Home from "./components/Home";
import Search from './components/Search';
import Footer from './components/Footer';
import Detail from './components/Detail';
import Pesan from './components/Pesan';
import Alfa from './components/Alfa';
import Signin from './components/Signin';
import Favorite from './components/Favorite';
import Setting from './components/DashboardSetting/Setting';
import Index from './components/admin/Index'
import { refreshToken, setInterceptors } from './components/Logic/GetRequest';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState('');
  const [token, setToken] = useState('');
  const [expire, setExpire] = useState('');
  const [user, setUser] = useState('');
  const [keyword, setKeyword] = useState('');
  const [idSocket, setIdSocket] = useState('')

  useEffect(() => {
    const socket_connect = io("ws://localhost:5000", {transports: ["websocket"]});
    setSocket(socket_connect);
    socket_connect.on('connect', function() {
      if(socket_connect.id !== idSocket)setIdSocket(socket_connect.id);
    });
  }, []);

  useEffect(() => {
    if(idSocket){
      refreshToken(idSocket).then((res)=>{
        console.log('token')
        setToken(res.token);
        setUser(res.user);
        setToken(res.token);
        setExpire(res.user.exp);
      });
    }
  }, [idSocket])
  
  
  useEffect(()=>{
    if(expire){
      setInterceptors(expire, (resetToken, userRespose)=>{
        setToken(resetToken);
        setExpire(userRespose.exp);
      });
    }
  },[expire]);

  return (
    <BrowserRouter>
      <Header setToken={setToken} setUser={setUser} setKeyword={setKeyword} socket={socket} user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<Home />} />
          <Route path="/search" element={<Search keyword={keyword} />} />
          <Route path="/detail/:id" element={<Detail token={token} id={user.userId} />} />
          <Route path="/signin" element={<Signin idSocket={socket.id} setToken={setToken} setUser={setUser} setExpire={setExpire} />} />
          <Route path="/signin/:user" element={<Signin idSocket={socket.id} setToken={setToken} setUser={setUser} setExpire={setExpire} />} />
          <Route path="/order" element={(token)? <Pesan userId={user.userId} token={token} /> : <Home />} />
          <Route path="/alfamart/:id" element={(token)? <Alfa token={token} id={user.userId} /> : <Home />} />
          <Route path="/favorite" element={(token)? <Favorite id={user.userId} token={token} /> : <Home />} />
          <Route path="/setting/:section" element={(token)? <Setting token={token} id={user.userId} socket={socket} /> : <Home />} />
          <Route path="/admin" element={(token)? <Index id={user.userId} token={token} /> : <Home />} />
        </Routes>
      <Footer />
    </BrowserRouter>
    
  );
}

export default App;
