import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import { sendPostToken } from '../Logic/GetRequest';

function Setting(props) {
  const [fields, setFields] = useState([]);
  useEffect(() => {
    if(Object.keys(props).length>0){
      sendPostToken('/owner/field/list',{id:props.id}, props.token)
      .then(setFields)
    }
  }, [props])
  
  return (
    <div>
      <Table bordered hover responsive>
            <thead>
                <th className='border text-center'>No</th>
                <th className='border text-center'>Nama Lapang</th>
                <th className='border text-center'>Harga</th>
                <th className='border text-center'>description</th>
                <th className='border text-center'>address</th>
                <th className='border text-center'>Google Map</th>
                <th className='border text-center'>image</th>
                <th className='border text-center'>jumlah Lapang</th>
                <th className='border text-center'>Pilih</th>
            </thead>
            <tbody>
                {fields.map((data, idx)=>(
                    <tr key={data.id}>
                        <td>{idx+1}</td>
                        <td>{data.name}</td>
                        <td>{data.price}</td>
                        <td>{data.description}</td>
                        <td>{data.address}</td>
                        <td style={{width:"250px", wordBreak:"break-word"}}>{data.map}</td>
                        <td>{data.images.map(image=>(<img className='m-1' src={image.source} alt={image.id} width={200} />))}</td>
                        <td>{data.field_choosers.length}
                        </td>
                        <td>
                          <Icon icon="line-md:cancel-twotone" width={28} color="red" />
                          <Icon icon="teenyicons:edit-circle-outline" width={28} color="#0fa958" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
  )
}

export default Setting