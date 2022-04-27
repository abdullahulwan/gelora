import React, { useEffect, useState } from 'react'
import {
    Modal,
    Button,
} from 'react-bootstrap';
import { sendPostToken } from '../Logic/GetRequest';

function ModalDetail(props) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if(props.id){
      sendPostToken('/ordered/detail',{id:props.id}, props.token)
      .then(({total, detail})=>{
        setData(detail);
        setTotal(total);
      })
    }
  }, [props])
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
            Datail Pesanan
        </Modal.Title>
      </Modal.Header>
      <Modal.Body scrollable>
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
                <p className='mb-0'>Rp {total},-</p>
                <p className='mb-0'>-Rp 50.000,-</p>
              </div>
            </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDetail