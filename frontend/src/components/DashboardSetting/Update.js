import React from 'react'
import imaga from '../../img/voli.jpg'
import {
  Form,
  Row
} from 'react-bootstrap'

function Update(props) {
  return (
      <div className={props.classCom}>
        <div className='d-flex justify-content-between'>
            <h3 className='fw-bold d-block mb-3'>Menunggu Pembayaran</h3>
            <h5 className="text-end fw-bold">
                filter :
                <Form.Select aria-label="Urutan" className="urutan">
                    <option value="semua" selected>Semua</option>
                    <option value="info">info</option>
                    <option value="promo">promo</option>
                    <option value="aktivasi">aktivasi</option>
                </Form.Select>
            </h5>
        </div>
        <div className='w-100 rounded-base border mb-2'>
            <div className='bg-warning px-3 py-2 top-rounded d-flex justify-content-between'>
                <p className='mb-0 fw-bold'>Promo</p>
                <p className='mb-0'>15 Sep 2021, 07:29</p>
            </div>
            <Row className='mx-2 mb-2'>
                <div className='col-lg-8'>
                    <h5>Diskon hingga Rp. 20.000,- Untuk pemesan pertama kali</h5>
                    <p>Ayo lakukan pemesanan pertamamu</p>
                </div>
                <div className='col-lg-4 py-1'>
                    <img src={imaga} alt='alfamart' width='100%'/>
                </div>
            </Row>
        </div>
        <div className='w-100 rounded-base border'>
            <div className='bg-warning px-3 py-2 top-rounded d-flex justify-content-between'>
                <p className='mb-0 fw-bold'>Info</p>
                <p className='mb-0'>15 Sep 2021, 07:29</p>
            </div>
            <div className='p-2'>
              <h5>Mohon Untuk Melakukan Verifikasi Email dan No. telepon Anda</h5>
              <p>Melakukan verifikasi Email dan No. telepon sangat wajib dilakukan untuk meningkatkan keamanan akun anda.</p>
            </div>
        </div>
    </div>
  )
}

export default Update