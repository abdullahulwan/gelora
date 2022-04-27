import {useEffect, useState} from 'react'
import { Icon } from '@iconify/react';
import alfa from '../../img/alfamart.png';
import {
  Modal,
  Dropdown,
  Button
} from 'react-bootstrap';
import { getData, sendPostToken } from '../Logic/GetRequest'

function ModalPembayaran(props) {
    const [selectedMethod, setSelectedMethod] = useState(0);
    const [drop, setDrop] = useState(false);
    const [data, setData] = useState([]);
    const [method, setMethod] = useState([]);
    const [saldo, setSaldo] = useState(0);
    useEffect(() => {
      getData('/payment/method')
      .then(setMethod)
    }, [])
    
    useEffect(() => {
      if(Object.keys(props).length>0){
        setData(props.data);
        sendPostToken('/saldo', {id:props.idUser}, props.token).then(({Saldo})=>setSaldo(Saldo));
      }
    }, [props])
    const submitHandler = () =>{
      const body = new FormData();
      body.append('method',method[selectedMethod].id);
      data.forEach(e=>{
        return e.order.forEach(elm => {
          body.append('id',elm.id);
        });
      })
      body.append('user',props.idUser);
      props.send(body);
    }
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className='border-bottom-0 py-1' closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className='fw-bold'>
            Pembayaran
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='pt-0 px-0'>
        <div className='box rounded-0 pt-2 my-2 pb-3'>
            <h5 className='fw-bold ms-3'>Metode Pembayaran</h5>
            {(method.length>0)?
            <Dropdown onSelect={setSelectedMethod} onToggle={(e)=>setDrop(e)} className='mx-4'>
                <Dropdown.Toggle variant="outline-primary" className='d-flex justify-content-between px-2 py-1 w-100 rounded' id="dropdown-basic">
                  <div className='d-flex flex-nowrap'>
                  {(method[selectedMethod].source_type	=== 'image') ?
                    <img src={method[selectedMethod].source} alt={method[selectedMethod].name} height={40} className='me-2' />
                    :<Icon icon={method[selectedMethod].source} height={40} className='me-2' color="#4ecb71" />
                  }
                  {(method[selectedMethod].name === 'Saldo')?
                    <div className='d-inline'>
                      <p className='m-0'>Sado</p>
                      <p className='m-0'>Rp {saldo}</p>
                    </div>
                    :<p className='d-inline-block'>{method[selectedMethod].name}</p>
                  }
                  </div>
                  <Icon icon="dashicons:arrow-down-alt2" color="#666" width={32} className='align-self-center' style={{transform:(drop)?'rotate(180deg)':''}} />
                </Dropdown.Toggle>

                <Dropdown.Menu className="w-100">
                  {method.map((item, idx)=>
                    <Dropdown.Item eventKey={idx} className='d-flex px-2 py-1' active={selectedMethod ===idx}>
                      {(item.source_type	=== 'image') ?
                        <img src={item.source} alt={item.name} height={40} className='me-2' />
                        :<Icon icon={item.source} height={40} className='me-2' color="#4ecb71" />
                      }
                    {(idx === 0)?
                      <div className='d-inline'>
                        <p className='m-0'>Sado</p>
                        <p className='m-0'>Rp {saldo}</p>
                      </div>
                      :<p className='d-inline-block'>{item.name}</p>
                    }
                        
                    </Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            :''}
        </div>
        <div className='box rounded-0 my-2 pt-2 px-2 pb-3'>
            <h5 className='fw-bold ms-1'>Detail Pembayaran</h5>
            <div className='w-100 overflow-auto' style={{height:'40vh'}}>
              <table className='w-100' >
                <tbody className='w-100 '> 
                  {data.map((dataVal, idx)=>
                  <>
                    <tr className={(idx>0)?'border-top':''}>
                      <td colSpan={2} className='fw-bold'>{dataVal.fieldName}</td>
                    </tr>
                    <tr>
                      <td>Harga</td>
                      <td>Rp {dataVal.price}</td>
                    </tr>
                    {dataVal.order.map((dataOrder, idx)=>
                      <>
                        <tr>
                          <td colSpan={2} className='fw-bold'>Pesanan {idx+1}</td>
                        </tr>
                        <tr>
                          <td>
                            Lapang :
                            <ul>
                              {dataOrder.fields.map((lap, ky)=><li key={lap.id}>{lap.name}</li>)}
                            </ul>
                          </td>
                          <td>x{dataOrder.fields.length}</td>
                        </tr>
                        <tr>
                          <td>Duration :<br/> {dataOrder.start} - {dataOrder.end}</td>
                          <td>{dataOrder.duration/60} Jam</td>
                        </tr>
                        <tr>
                          <td>
                            Tanggal :
                            <ul>
                              {dataOrder.date.map((lap, ky)=><li key={lap.id}>{lap}</li>)}
                            </ul>
                          </td>
                          <td>x{dataOrder.date.length}</td>
                        </tr>
                      </>
                      )}
                  </>  
                  )}
                </tbody>
              </table>
            </div>
            <div className='border-top mx-2 mt-2 pe-5 d-flex justify-content-between'>
              <div>
                <p className='mb-0'>Total Tagihan</p>
                <p className='mb-0'>Diskon Promo</p>
              </div>
              <div>
                <p className='mb-0'>Rp {data.reduce((tot,v)=>tot+v.order.reduce((tot,p)=>tot+p.price_total,0),0)},-</p>
                <p className='mb-0'>-Rp 50.000,-</p>
              </div>
            </div>
          </div>
      </Modal.Body>
      <Modal.Footer className='border-top-0 py-1 d-flex justify-content-between'>
        <div>
            <p className='fw-bold mb-0'>Total Pembayaran</p>
            <p className='ms-2 mb-0'>Rp 350.000,-</p>
        </div>
        <Button onClick={submitHandler} className='btn btn-primary btn-rounded'>Bayar</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalPembayaran