import { useState, useEffect} from 'react'
import bglogin from '../img/bglogin.jpg'
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import {
  FloatingLabel,
  Form,
  Button
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { postAccounts } from './Logic/GetRequest';

const Login = (props)=>{
  const [user,setUser] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const Auth = async (e) => {
    e.preventDefault();
    postAccounts('/login',{ user: user, password: password, idSocket:props.idSocket})
      .then(({token, user})=> {
          props.setToken(token);
          props.setUser(user);
          props.setExpire(user.exp);
          navigate("/");
        })
      .catch((error) => {
          if(error.response) {
            setMsg(error.response.data.msg);
          }
        }
      );
    }

  return (
    <form onSubmit={Auth} className='body'>
      <p className='text-danger'>{msg}</p>
      <div className="mb-3 d-flex align-items-center">
        <Icon icon="ic:sharp-alternate-email" width={32} className='text-info me-3 align-self-center' />
        <FloatingLabel
          controlId="floatingInput"
          label="Email / username"
          className="w-100"
        >
          <Form.Control type="text" placeholder="Email / username"
          value={user}
          onChange={(e)=>setUser(e.target.value)}
          />
        </FloatingLabel>
      </div>
      <div className="mb-3 d-flex align-items-center">
        <Icon icon="bxs:lock" width={32} className='text-info me-3 align-self-center' />
        <FloatingLabel 
          controlId="floatingPassword" 
          label="Password"
          className="w-100"
          >
          <Form.Control type="password" placeholder="Password" 
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          />
        </FloatingLabel>
      </div>
      <Button type='submit' variant={'info'} className='w-100 fw-bold fs-4 btn-rounded text-white' >Masuk</Button>
      <p className='text-center mt-5 mb-3'>Atau Login dengan</p>
      <div className='d-flex justify-content-center'>
        <Button variant={'outline-dark'} href={"http://localhost:5000/auth/google"} className="border border-3 border-dark rounded-pill fw-bold">
          <Icon icon="flat-color-icons:google" color="#0aa7bd" width={28} className='rounded-circle me-3'/>
          Google
        </Button>
      </div>
    </form>
  );
}

const Register = (props) =>{
  const [msg, setMsg] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setconfPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [idGoogle, setIdGoogle] = useState(0);
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    if(Object.keys(props).length>0){
      if(props.user){
        const user = jwt_decode(props.user);
        setIdGoogle(user.id);
        setEmail(user.emails[0].value);
        setAvatar(user.photos[0].value);
        setFirstName(user.name.givenName);
        setLastName(user.name.familyName);
      }
    }
  }, [props])
  

  const navigate = useNavigate();

  const handlerRegister = async (e) => {
    e.preventDefault();
    const data = {
      firstName,
      lastName,
      username,
      sex,
      address,
      phone,
      dateOfBirth,
      email,
      password,
      confPassword,
      agreement,
      idGoogle,
      avatar,
      idSocket:props.idSocket
    };
    postAccounts("/register", data)
      .then(({token, user})=>{
        props.setToken(token);
        props.setUser(user);
        props.setExpire(user.exp);
        Swal.fire({
          icon: 'success',
          title: 'Akun ada behasil dibuat',
          showConfirmButton: false,
          timer: 1500
        });
        navigate("/");
      })
      .then((error) => {
        if (error.response) {
          setMsg(error.response.data.message);
        }
      });
  }
  

  return (
    <form onSubmit={handlerRegister} className='body'>
      <p className='text-danger'>{msg}</p>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="Nama Dapan"
          className="w-100"
        >
          <Form.Control type="text" placeholder="Nama Depan"
          value={firstName}
          onChange={(e)=>setFirstName(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="Nama Belakang"
          className="w-100"
        >
          <Form.Control type="text" placeholder="Nama Belakang" 
          value={lastName}
          onChange={(e)=>setLastName(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="Username"
          className="w-100"
        >
          <Form.Control type="text" placeholder="Username" 
          value={username}
          onChange={(e)=>setUsername(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <p className='fw-bold mb-0'>Jenis Kelamin</p>
        <Form.Check inline type={'radion'} className='d-inline-flex align-items-center' name="jk" id={`check-api`}>
          <Form.Check.Input id='l' checked={(sex==='l')} onChange={(e)=>setSex((e.currentTarget.checked)? 'l':'')} className='align-self-center me-1' type={'radio'} />
          <Form.Check.Label htmlFor='l'>
            <Icon icon="emojione-monotone:boy" width={32} className='me-1' color="#444" />
            Laki - Laki
          </Form.Check.Label>
        </Form.Check>
        <Form.Check inline type={'radion'} className='d-inline-flex align-items-center' name="jk" id={`check-api`}>
          <Form.Check.Input id="p" checked={(sex==='p')} onChange={(e)=>setSex((e.currentTarget.checked)? 'p':'')} className='align-self-center me-1' type={'radio'} />
          <Form.Check.Label htmlFor="p">
            <Icon icon="emojione-monotone:girl" width={32} className='me-1' color="#444" />
            Perempuan
          </Form.Check.Label>
        </Form.Check>
      </div>
      <FloatingLabel controlId="floatingTextarea" label="Alamat" className="mb-3">
        <Form.Control as="textarea" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Masukkan Alamat" />
      </FloatingLabel>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="No. Telp"
          className="w-100"
        >
          <Form.Control type="tel" placeholder="Masukkan No. Telp" 
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="Tanggal Lahir"
          className="w-100"
        >
          <Form.Control type="date" placeholder="Masukkan Tanggal Lahir"
          value={dateOfBirth}
          onChange={(e)=>setDateOfBirth(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel
          controlId="floatingInput"
          label="Email"
          className="w-100"
        >
          <Form.Control type="email" placeholder="Masukkan Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}/>
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel 
          controlId="floatingPassword" 
          label="Password"
          className="w-100"
          >
          <Form.Control type="password" placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          />
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <FloatingLabel 
          controlId="floatingPassword" 
          label="Konfirmasi Password"
          className="w-100"
          >
          <Form.Control type="password" placeholder="Konfirmasi Password"
          value={confPassword}
          onChange={(e)=>setconfPassword(e.target.value)}
          />
        </FloatingLabel>
      </div>
      <div className="mb-3">
        <Form.Check 
          type={'checkbox'}
          id={`confirm`}
          label={`Saya menyetujui Ketentuan, Kebijakan Data dan Kebijakan Cookie Gelora.`}
          value={agreement}
          onChange={(e)=>setAgreement(e.currentTarget.checked)}
        />
      </div>
      <Button type='submit' variant={'info'} className='w-100 fw-bold fs-4 btn-rounded text-white' >Daftar</Button>
    </form>
  );
}

function Signin(props) {
    const [method, setMethod] = useState('signin');
    const {user} = useParams();
    useEffect(()=>{
      const elBg = document.getElementById('bglogin');
      elBg.style.backgroundImage = `url('${bglogin}')`;
      elBg.style.backgroundSize = "cover";
      elBg.style.backgroundPosition = "0% 40%";
      if(user){
          setMethod('signup');
          Swal.fire(
            'Akun anda belum terdaftar',
            'Silahkan Untuk melanjutkan pendaftan akun.',
            'warning'
          )
      }
    },[]);
    

  return (
    <div id="bglogin">
      <div className='container container-login d-flex justify-content-end py-5'>
          <div className='content-signin'>
            <div className='d-flex'>
              <div onClick={()=>setMethod('signin')} className={'tab-signin no-box-size py-3 text-black text-center w-100 fw-bold fs-4 pointer '+((method === 'signin')?'active':'unselect')}>SignIn</div>
              <div onClick={()=>setMethod('signup')} className={'tab-signup no-box-size py-3 text-black text-center w-100 fw-bold fs-4 pointer '+((method === 'signup')?'active':'unselect')}>SignUp</div>
            </div>
            {(method==='signin')? <Login {...props} /> : <Register {...props} user={user} />}
          </div>
        </div>
    </div>
  )
}

export default Signin