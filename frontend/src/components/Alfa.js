import {useState, useEffect} from 'react';
import Countdown from "react-countdown";
import moment from 'moment';
import { Button } from 'react-bootstrap';
import alfa from '../img/alfamart.png';
import { Icon } from '@iconify/react';
import ModalDetail from './Modal/ModalDetail';
import {useNavigate, useParams} from 'react-router-dom';
import { sendPostToken } from './Logic/GetRequest';
import Swal from 'sweetalert2';

function Alfa(props) {
    const [modalShow, setModalShow] = useState(false);
    const [code, setCode] = useState('');
    const [time, setTime] = useState(new Date());
    const [price, setPrice] = useState('');
    const {id} = useParams();
    const [orderId, setOrderId] = useState('');
    const navigate = useNavigate();
    const [payment, setPayment] = useState({})
    useEffect(()=>{
        if(props){
        sendPostToken('/getremaining',{id, user:props.id},props.token)
            .then(result=>{
                setCode(result.code);
                setOrderId(result.id);
                setTime(new Date(result.expire));
                setPayment(result.payment_methode);
                setPrice(result.price);
            });
        }
    }, [id,props])
  return (
    <div className='container'>
        <ModalDetail
        show={modalShow}
        token={props.token}
        id={orderId}
        onHide={() => setModalShow(false)}
        />
        <div className='content-container pb-4'>
            <h2 className='border-bottom mb-3 py-2 px-3'>Pemesanan</h2>
            <div className='text-center'>
                <h1 className='fw-bold'>Selesaikan Pembayaran</h1>
                <Countdown date={time.getTime()} key={time.getTime()} renderer={({ hours, minutes, seconds, completed }) => {
                    return (<p className='text-danger'>{hours}:{minutes}:{seconds}</p>)
                }} />
                <p>Batas Akhir Pembayaran</p>
                <p>{moment(time).format("dddd, DD MMMM yyyy HH:MM")}</p>
            </div>
            <div className='rounded-base w-50 mx-auto border'>
                <div className='border-bottom d-flex justify-content-between px-3 pt-2'>
                    <h3>{payment.name}</h3>
                    <img src={payment.source} alt={payment.name} height={40} />
                </div>
                <div className='px-3 pb-3 pt-1'>
                    <p className='mb-0'>Kode Pembayaran</p>
                    <p className='fw-bold mb-0'>
                        {parseInt(orderId, 16)}C{code} 
                        <Button variant='white' className='text-primary' onClick={()=> navigator.clipboard.writeText(parseInt(orderId, 16)+'C'+code)}>
                            Salin 
                        <Icon icon="fluent:document-copy-20-filled"/>
                        </Button>
                    </p>
                    <p className='mb-0'>Total Pembayaran</p>
                    <p className='fw-bold'>Rp {price},-</p>
                    <div className='d-flex justify-content-evenly'>
                        <Button onClick={() => setModalShow(true)} variant='outline-primary'>Cek Pemesanan</Button>
                        <Button onClick={() => navigate('/setting/wait')} variant='primary'>Lihat Semua Transaksi</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Alfa