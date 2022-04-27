import {useEffect, useState} from 'react';
import { Icon } from '@iconify/react';
import Account from './Account';
import Chat from '../Chat';
import Waitting from './Waitting';
import Ulasan from './Ulasan';
import Update from './Update';
import {useNavigate,useParams, Link} from 'react-router-dom';
import Transaksi from './Transaksi';
import { sendPostToken } from '../Logic/GetRequest';
import Swal from 'sweetalert2';
import Saldo from './Saldo';

const Content = (props)=>{
  let content;
  const navigate = useNavigate();
  switch (props.section) {
    case 'account':
      content = (<Account classCom={'col-md-8 p-3'} token={props.token} data={props.data} setUpdate={props.setUpdate} />)
      break;
    case 'chat':
      content = (<Chat minHeight='710px' classChat={'col-md-8 p-0'} id={props.id} token={props.token} socket={props.socket} />)
      break;
    case 'wait':
      content = (<Waitting classCom={'col-md-8 p-3'} id={props.id} token={props.token} />)
      break;
    case 'ulasan':
      content = (<Ulasan classCom={'col-md-8 p-3'} />)
      break;
    case 'update':
      content = (<Update classCom={'col-md-8 p-3'} />)
      break;
    case 'transaksi':
      content = (<Transaksi classCom={'col-md-8 p-3'} id={props.id} token={props.token} />)
      break;
    case 'saldo':
      content = (<Saldo classCom={'col-md-8 p-3'} id={props.id} data={props.data} token={props.token} />)
      break;
  
    default:
      navigate('/');
      content ='';
      break;
  }
  return content;
}

function Setting(props) {
  const [name, setName] = useState('');
  const [saldo, setSaldo] = useState('');
  const [avatar, setAvatar] = useState('');
  const [data, setData] = useState({});
  const [update, setUpdate] = useState(false);
  const [token, setToken] = useState('');
  
  const {section} = useParams();
  
  useEffect(()=>{
    if(Object.keys(props).length>0){
      if(props.token !== token || update){
        setToken(props.token);
        sendPostToken("/user",{id:props.id}, props.token)
          .then((user)=>{
            setData(user);
            setAvatar(user.avatar);
            setSaldo(user.Saldo);
            setName(`${user.firstName} ${user.lastName}`);
          }).catch(()=>{
              Swal.fire(
                  'Gagal mendapat Data',
                  'Periksa Internet Anda Mungkin Bermsalah',
                  'error'
              )
          });
        setUpdate(false);
      }
    }
  }, [props, update]);

  const hideSection = (e) =>{
    const elm = e.target;
    if(elm.nodeName)
    elm.parentElement.children[1].classList.toggle('rotate');
    elm.parentElement.parentElement.children[1].classList.toggle('d-none');
  }

  return (
    <div className='container py-5'>
      <div className='setting'>
        <div className='col-md-4 px-0'>
          <div className='ps-4 py-4 d-flex'>
            <img src={(avatar) ? avatar : '#'} referrerPolicy="no-referrer" alt={name} width={70} height={70} style={{objectFit: "cover"}} className='rounded-circle me-2' />
            <h4 className='fw-bold text-wrap align-self-center mb-0'>{name}</h4>
          </div>
          <Link to={'/setting/saldo'} className='p-3 d-flex justify-content-between border-top no-u text-black'>
            <div>
              <Icon icon="ic:twotone-account-balance-wallet" height={40} className='me-2' color="#4ecb71" />
              <p className='mb-0 d-inline-block'>Sado</p>
            </div>
            <p className='mb-0 align-self-center'>Rp. {saldo},-</p>
          </Link>
          <div className='p-3 border-top'>
            <div id='kontak' className='pointer d-flex justify-content-between position-relative'>
              <p className='mb-0 fw-bold align-self-center'>Kontak Masuk</p>
              <Icon icon="ri:arrow-drop-down-line" className='rotate' height={40} color="#444" />
              <div className='position-absolute w-100 h-100' onClick={hideSection}></div>
            </div>
            <div id='kontak-menu' className='ps-2'>
              <Link to={'/setting/chat'} className='text-start btn btn-white d-block mb-1'>Chat</Link>
              <Link to={'/setting/ulasan'} className='text-start btn btn-white d-block mb-1'>Ulasan</Link>
              <Link to={'/setting/update'} className='text-start btn btn-white d-block mb-1'>Update</Link>
            </div>
          </div>
          <div className='p-3 border-top'>
            <div id='kontak' className='pointer d-flex justify-content-between position-relative'>
              <p className='mb-0 fw-bold align-self-center'>Pemesanan</p>
              <Icon icon="ri:arrow-drop-down-line" className='rotate' height={40} color="#444" />
              <div className='position-absolute w-100 h-100' onClick={hideSection}></div>
            </div>
            <div id='kontak-menu' className='ps-2'>
              <Link to={'/setting/wait'} className='btn btn-white text-start d-block mb-1'>Menunggu Pembayaran</Link>
              <Link to={'/setting/transaksi'} className='btn btn-white text-start d-block mb-1'>Daftar Transaksi</Link>
            </div>
          </div>
          <div className='p-3 border-top'>
            <div id='kontak' className='pointer d-flex justify-content-between position-relative'>
              <p className='mb-0 fw-bold align-self-center'>Profile</p>
              <Icon icon="ri:arrow-drop-down-line" className='rotate' height={40} color="#444" />
              <div className='position-absolute w-100 h-100' onClick={hideSection}></div>
            </div>
            <div id='kontak-menu' className='ps-2'>
              <Link to={'/favorite'} className='btn btn-white text-start d-block mb-1'>Favorite</Link>
              <Link to={'/setting/account'} className='btn btn-white text-start d-block mb-1'>Pengaturan</Link>
            </div>
          </div>
        </div>
          <Content section={section} data={data} setUpdate={props.setUpdate} id={props.id} token={props.token} socket={props.socket} />
      </div>
    </div>
  );
}

export default Setting;