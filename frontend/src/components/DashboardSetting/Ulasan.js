import { 
    Button,
    Form,
    Row,
    FloatingLabel
 } from 'react-bootstrap'
import { Icon } from '@iconify/react';
import image from "../../img/profile_lapangan.jpg";

function Ulasan(props) {
  return (
    <div className={props.classCom}>
        <div className='d-flex justify-content-between'>
            <h3 className='fw-bold d-block mb-3'>Ulasan</h3>
            <h5 className="text-end fw-bold">
                filter :
                <Form.Select aria-label="Urutan" className="urutan">
                    <option value="semua waktu" selected>Semua Waktu</option>
                    <option value="hari">hari ini</option>
                    <option value="minggu">minggu ini</option>
                    <option value="Bulan">Bulan ini</option>
                </Form.Select>
            </h5>
        </div>
        <div className='w-100 top-rounded border'>
            <div className='bg-warning px-3 py-2 top-rounded'>
                <p className='mb-0'>Dipesanan: 15 Sep 2021, 07:29</p>
            </div>
            <Row className='m-0'>
                <div className='col-md-3 px-0'>
                    <img src={image} alt='alfamart' width={"100%"}/>
                </div>
                <div className='col-md-9'>
                    <h5 className='fw-bold'>Gor Tunas Arena</h5>
                    <div className='d-flex justify-content-between mb-1'>
                        <div>
                            <Icon icon="ant-design:star-filled" width={32} className='text-warning' />
                            <Icon icon="ant-design:star-filled" width={32} className='text-warning' />
                            <Icon icon="ant-design:star-filled" width={32} className='text-warning' />
                            <Icon icon="ant-design:star-filled" width={32} className='text-warning' />
                            <Icon icon="ant-design:star-filled" width={32} className='text-warning' />
                        </div>
                        <div className='text-white fw-bold'>
                            <Button variant='success' className='py-1 px-2'>Edit</Button>
                            <Button variant='primary' className='py-1 px-2'>Save</Button>
                        </div>
                    </div>
                    <FloatingLabel controlId="floatingTextarea" label="Ulsanan" className="mb-1">
                        <Form.Control as="textarea" placeholder="Ulasan...." disabled/>
                    </FloatingLabel>
                    <div className='text-white fw-bold d-flex justify-content-between'>
                        <Button variant='primary'>Pesan lagi</Button>
                        <Button variant='info'>Lihat ulasan</Button>
                    </div>
                </div>
            </Row>
        </div>
    </div>
  )
}

export default Ulasan