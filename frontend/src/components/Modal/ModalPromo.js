import {useState} from 'react';
import {
  Modal,
  Button,
  InputGroup,
  FormControl,
  Form
} from 'react-bootstrap';
import { Icon } from '@iconify/react';
function ModalPromo(props) {
  const [promo, setPromo] = useState("");
  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className='border-bottom-0 py-1' closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className='fw-bold'>
          Pakai Promo
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='pt-0'>
        <InputGroup className="search-promo mb-3">
          <FormControl
            placeholder="Ketik kode promo atau cari promo"
            aria-describedby="basic-addon2"
            className='btn-rounded me-2'
          />
          <Button variant={'info'} className='border btn-rounded' id="button-addon2">
            Terapkan
          </Button>
        </InputGroup>
        <p className='fw-bold fs-5'>Pilih Promo</p>
        <div className='border p-1'>
          <Icon icon="mdi:ticket-percent-outline" color="#666" width={24}/>
          <p className='d-inline'>Kupon Saya</p>
          <div className='border p-1 d-flex justify-content-between mx-2 my-1'>
            <div>
              <p className='fw-bold m-0 fs-5'>Discount Rp. 50.000,-</p>
              <p className='m-0'>min belanja Rp.200.000</p>
              <p className='m-0'>berakhir 2 April 2022</p>
            </div>
            <Form.Check
              inline
              label="Promo1"
              name="radio-buttons"
              type={"radio"}
              checked={promo === 'Promo1'}
              id={`inline-1`}
              onChange={(e)=>setPromo(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className='border-top-0 py-1 bg-warning d-flex justify-content-between'>
        <p>Potongan : Rp. 50.000,-</p>
        <Button variant={'info'} className='btn-rounded py-1' onClick={props.onHide}>Gunakan</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalPromo