import { useState, useEffect } from 'react';
import { 
    Row,
    Col,
    Button,
    Nav,
    Tab,
    Form
} from 'react-bootstrap';
import ModalPesan from './Modal/ModalPesan';
import { Icon } from '@iconify/react';
import ModalPromo from './Modal/ModalPromo';
import ModalPembayaran from './Modal/ModalPembayaran';
import {Link, useNavigate} from 'react-router-dom';
import { sendPostToken, getData, sendDeleteToken } from './Logic/GetRequest';
import Swal from 'sweetalert2';

function Pesan(props) {
    const [change, setChange] = useState(false);
    const [promo, setPromo] = useState(false);
    const [selectedField, setSelectedField] = useState();
    const [price, setPrice] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [fieldChoosers, setFieldChoosers] = useState([]);
    const [fieldId, setFieldId] = useState();
    const [payment, setPayment] = useState(false);
    const [listOrder, setListOrder] = useState([]);
    const [selectedPay, setSelectedPay] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        if(props.userId){
            sendPostToken('/order/list',{iduser:props.userId},props.token)
                .then(setListOrder);
        }
    }, [props])
    
    const getTime = (time)=>{
        const [hours, minutes] = time.split(':');
        const setTime = new Date();
        setTime.setHours(parseInt(hours,10));
        setTime.setMinutes(parseInt(minutes, 10));
        return setTime.getTime();
    }

    const diffMinutes = (a,b)=>{
        const diffTime = getTime(a) - getTime(b);
        return Math.ceil(diffTime / (1000 * 60));
    }

    const handlerFieldChange = (id,dataField)=>{
        setFieldId(id);
        setSelectedField(dataField);
        getData(`/field/${id}`)
            .then((fields)=>{
                setFieldChoosers(fields.field_choosers);
                setPrice(fields.price);
                setSchedules(fields.schedules);
                setChange(true);
            });
    }

    const deleteField = (id) =>{
        Swal.fire({
            title: 'Anda yakin pesanan akan di hapus?',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonText: 'Hapus',
            confirmButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                sendDeleteToken('/order/delete',{idField:id, idUser:props.userId},props.token) 
                    .then(()=>{
                        Swal.fire(
                            'Berhasil',
                            'Berhasil DiHapus',
                            'success'
                        );
                        sendPostToken('/order/list',{iduser:props.userId},props.token)
                            .then((orders_field)=>{
                                setListOrder(orders_field);
                                setSelectedPay([]);
                            });
                    })
            }
        })
    }

    const selectedHandler = (e, data, id) =>{
        if(e.currentTarget.checked){
            setSelectedPay(slt=>[...slt,data])
        }else{
            const slt = [...selectedPay];
            slt.splice(selectedPay.findIndex((sle=>id === sle.fieldId),1));
            setSelectedPay(slt);
        }
    }

  return (
    <div className='container'>
        <ModalPromo
        show={promo}
        onHide={() =>  setPromo(false)}
        idUser={props.userId}
        token={props.token}
        />
        <ModalPesan
            save='Simpan'
            show={change}
            price={price}
            schedules={schedules}
            fieldChoosers={fieldChoosers}
            idField={fieldId}
            idUser={props.userId}
            token={props.token}
            data={selectedField}
            onHide={() =>  setChange(false)}
            send={(input,success)=>{
            sendPostToken('/order/edit', input, props.token)
                .then(()=>{
                    Swal.fire(
                        'Berasil',
                        'Berhasil Disimpan',
                        'success'
                    );
                    sendPostToken('/order/list',{iduser:props.userId},props.token)
                        .then((orders_field)=>{
                            setListOrder(orders_field);
                            setSelectedPay([])
                            success();
                            setChange(false);
                        });
                });
            }}
        />

        <ModalPembayaran
        show={payment}
        data={selectedPay}
        idUser={props.userId}
        onHide={() =>  setPayment(false)}
        send={(input)=>{
            sendPostToken('/payment', input, props.token)
                .then((res)=>{
                    Swal.fire(
                        'Berhasil',
                        'Berhasil Terkirim',
                        'success'
                    );
                    sendPostToken('/order/list',{iduser:props.userId},props.token)
                        .then((orders_field)=>{
                            setListOrder(orders_field);
                        });
                    setSelectedPay([]);
                    setPayment(false);
                    console.log(res.status)
                    if(res.status === "Payment Pending") {
                        navigate(`/alfamart/${res.id}`)
                    }else{
                        navigate(`/setting/transaksi`)
                    }
                }).catch(error=>{
                    Swal.fire(
                        'Gagal',
                        error.message,
                        'error'
                    );
                })
        }}
        />
        <div className='content-container'>
            <h2 className='border-bottom mb-3 py-2 px-3'>Pemesanan</h2>
            <Row className='px-4'>
                <div className='col-8'>
                    <div className='my-2 px-2 check-all'>
                        <Form.Check
                            inline
                            name="group1"
                            type={"checkbox"}
                            id='all'
                        />
                        <label htmlFor="all">Pilih Semua</label>
                    </div>
                    {listOrder.map(field =>
                        <div key={field.fieldId} className='box my-2 ps-2 pe-1 d-flex justify-content-between  row'>
                            <div className='col p-0 d-flex flex-nowrap align-items-center justify-content-center'>
                                <Form.Check
                                    inline
                                    name="group1"
                                    type={"checkbox"}
                                    id={`select-${field.fieldId}`}
                                    checked={selectedPay.some(e=>field.fieldId === e.fieldId)}
                                    onChange={(e) => selectedHandler(e, field, field.fieldId)}
                                />
                                <Form.Label htmlFor={`select-${field.fieldId}`} className="pointer">
                                    <img src={field.image} alt='Gor Tunas Arena' width={200} />
                                </Form.Label>
                            </div>
                            <div className='col-md-5 p-1'>
                                <Link to={`/detail/${field.fieldId}`} className='no-u text-black'>
                                    <h4 className='fw-bold mb-0'>{field.fieldName}</h4>
                                </Link>
                                <Tab.Container id="left-tabs-example">
                                    <Row>
                                        <Col sm={4} className='pe-0'>
                                            <Nav variant="pills" className="flex-column">
                                                {field.order.map((item,idx)=>
                                                    <Nav.Item>
                                                    <Nav.Link eventKey={idx+1} className='fw-bold p-1 text-black pointer'>Paket {idx+1}</Nav.Link>
                                                    </Nav.Item>
                                                )}
                                            </Nav>
                                        </Col>
                                        <Col sm={8} className='pe-0'>
                                            <Tab.Content>
                                                {field.order.map((item,idx)=>
                                                    <Tab.Pane eventKey={idx+1}>
                                                        <p className='mb-0'>Waktu : {(item.start)} - {item.end}</p>
                                                        <p className='mb-0'>Duration : {diffMinutes(item.end, item.start)/60} Jam</p>
                                                        <p className='mb-0'>No. Lapang</p>
                                                        <ul className='ms-2 mb-0'>
                                                            {item.fields.map(fl=>
                                                                <li>{fl.name}</li>
                                                            )}
                                                        </ul>
                                                        <p className='mb-0'>Tanggal</p>
                                                        <ul className='ms-2 mb-0'>
                                                            {item.date.map(date=>
                                                                <li>{date}</li>
                                                            )}
                                                        </ul>
                                                    </Tab.Pane>
                                                )}
                                                
                                            </Tab.Content>
                                        </Col>
                                    </Row>
                                    </Tab.Container>
                            </div>
                            <div className='col-md-3 d-flex justify-content-end align-items-end flex-column bd-highlight px-0'>
                                <Button variant="white" onClick={()=>deleteField(field.fieldId)} className='bd-highlight mb-auto'>
                                    <Icon icon="bi:trash" color="#f24e1e" width={28} />
                                </Button>
                                <h5 className='bd-highlight fw-bold me-1'>Total Harga</h5>
                                <h4 className='bd-highlight me-1'>Rp. {field.order.reduce((tot,price)=>tot+price.price_total,0)}</h4>
                                <Button variant="success" className='bd-highlight rounded text-white mb-1 me-1' onClick={() => handlerFieldChange(field.fieldId, field.order)}>
                                    Ubah Pesanan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className='col-4'>
                    <div className="box btn-rounded p-2">
                        <Button variant="outline-secondary" className='w-100' onClick={()=>setPromo(true)}>
                            Gunakan Promo
                        </Button>
                        {selectedPay.length >0 ?
                        <div>
                            <div className='border-top border-bottom d-flex justify-content-evenly pt-1 my-3'>
                                <h4>Total Harga</h4>
                                <h4>Rp {selectedPay.reduce((tot,v)=>tot+v.order.reduce((tot,p)=>tot+p.price_total,0),0)},-</h4>
                            </div>
                            <Button variant="danger" className='btn-rounded w-100 fw-bold' onClick={()=>setPayment(true)}>
                                Pembayaran
                            </Button>
                        </div>
                            :<div className='py-1'></div>
                        }

                    </div>
                </div>
            </Row>
        </div>
    </div>
  )
}

export default Pesan