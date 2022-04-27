import {useState, useEffect} from 'react'
import alfa from '../../img/alfamart.png';
import { Icon } from '@iconify/react';
import {
    Form,
    Row,
    Button
} from 'react-bootstrap';
import ModalDetail from '../Modal/ModalDetail';
import { sendPostToken, sendDeleteToken } from '../Logic/GetRequest';
import moment from 'moment';
import Swal from 'sweetalert2';

function Transaksi(props) {
    const [modalShow, setModalShow] = useState(false);
    const [id, setId] = useState('')
    const [list, setList] = useState([])
    useEffect(()=>{
        if(props.id){
            sendPostToken('/ordered/list',{id:props.id}, props.token)
                .then(setList)
        }
    },[props]);
    const detailHandler = (id)=>{
        setId(id);
        setModalShow(true);
    }
    const compareNow = (time) =>{
        const selectedTime = new Date(time);
        const now = new Date();
        return selectedTime.getTime() > now.getTime();
    }
    const deleteOrder = (id)=>{
        Swal.fire({
            title: 'Anda yakin pesanan akan di hapus?',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Hapus',
            confirmButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                sendDeleteToken('/ordered/delete', {id}, props.token)
                .then(()=>{
                    Swal.fire(
                        'Berhasil',
                        'Berhasil Dihapus',
                        'success'
                        );
                    sendPostToken('/ordered/list',{id:props.id}, props.token)
                        .then(setList);
                }).catch(console.log)
            }
        });
    }
  return (
    <div className={props.classCom}>
        <ModalDetail
        id={id}
        token={props.token}
        show={modalShow}
        onHide={() => setModalShow(false)}
        />
        <div className='d-flex justify-content-between'>
            <h3 className='fw-bold d-block mb-3'>Daftar Transaksi</h3>
            <h5 className="text-end fw-bold">
                filter :
                <Form.Select aria-label="Urutan" className="urutan">
                    <option value="semua" selected>Semua</option>
                    <option value="dipesan">dipesan</option>
                    <option value="menunggu">Menunggu Pembayaran</option>
                    <option value="pesan">riwayat telah dipesan</option>
                </Form.Select>
            </h5>
        </div>
        <div style={{height:'90vh'}} className='overflow-auto'>
            {list.map(item=>(
                <div className='w-100 mb-3 rounded-base border'>
                    <div className='bg-warning px-3 py-2 top-rounded d-flex justify-content-between'>
                        {(item.expire)?
                            <p className={`mb-0 ${(compareNow(item.expire))?'':'text-light'}`}>Bayar sebelum : {moment(item.expire).format('DD MMMM YYYY, HH:mm')} {(compareNow(item.expire))?'':'(Expire)'}</p>
                            :<p className='mb-0'>Dipesan : {moment(item.createdAt).format('DD MMMM YYYY, HH:mm')}</p>
                        }
                        <Button variant="white" onClick={()=>deleteOrder(item.id)} className='bd-highlight py-0'>
                            <Icon icon="bi:trash" color="#f24e1e" width={24} />
                        </Button>
                    </div>
                    <Row className='mx-2 mb-2'>
                        <div className='col-lg-4'>
                            <h5>Metode Pembayaran</h5>
                                <div>
                                {(item.payment_methode.source_type==='image')?
                                    <img src={item.payment_methode.source} alt={item.payment_methode.name} height={40}/>
                                    :
                                    <Icon icon={item.payment_methode.source} height={40} className='me-2' color="#4ecb71" />
                                }
                                    <p className='d-inline-block fw-bold'>Alfamart / Alfamidi / Lawson / Dan+Dan</p>
                                </div>
                        </div>
                        <div className='col-lg-5'>
                            <h5>Kode pembayaran</h5>
                            <p className='fw-bold mb-0'>{parseInt(item.id, 16)}C{item.code}</p>
                            <Button variant='white' className='text-primary' onClick={()=> navigator.clipboard.writeText(parseInt(item.id, 16)+'C'+item.code)}>
                                Salin 
                            <Icon icon="fluent:document-copy-20-filled"/>
                            </Button>
                        </div>
                        <div className='col-lg-3 text-end'>
                            <h5>Total Pembayaran</h5>
                            <h5>Rp {item.price}</h5>
                            <Button onClick={() => detailHandler(item.id)} variant='outline-primary'>Cek Pemesanan</Button>
                        </div>
                    </Row>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Transaksi