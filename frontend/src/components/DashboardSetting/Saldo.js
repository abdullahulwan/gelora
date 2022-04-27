import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { Accordion, Col, Row } from 'react-bootstrap'

function Saldo(props) {
    const [topUp, setTopUp] = useState([]);
    useEffect(() => {
      
    }, [])
    
  return (
    <div className={props.classCom}>
        <h1>Saldo</h1>
        <div className='d-flex align-items-center border-bottom border-top mb-2'>
            <Icon icon="ic:twotone-account-balance-wallet" height={80} className='me-2' color="#4ecb71" />
            <div className='d-inline-block'>
                <p className='fs-5 mb-0'>Sisa Saldo</p>
                <p className='fs-5 mb-0'>Rp. {props.data.Saldo},-</p>
            </div>
        </div>
        <Row>
            <Col md={6} className='border-end'>
                <h4 className='text-center'>TopUp</h4>
                {/* <Accordion defaultActiveKey="0">
                        <Accordion.Item key={index} eventKey={index}>
                        <Accordion.Header>
                            <img src={alfa} alt='Alfamart' height={40} className='me-2' />
                            <p className='d-inline-block'>Alfamart / Alfamidi</p>
                        </Accordion.Header>
                        <Accordion.Body>
                            
                        </Accordion.Body>
                        </Accordion.Item>
                    )}
                    </Accordion> */}
            </Col>
            <Col md={6}>
                <h4 className='text-center'>Riwayat TopUp</h4>
            </Col>
        </Row>
    </div>
  )
}

export default Saldo