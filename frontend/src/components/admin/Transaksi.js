import { Icon } from '@iconify/react';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap';
import { sendPostToken } from '../Logic/GetRequest';

function Transaksi(props) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
  if(Object.keys(props).length>0){
      sendPostToken('/owner/order/transaction',{id:props.id}, props.token)
      .then(response=>{
          const orders_field = [];
          response.forEach(field => {
              field.order_Times.forEach(time => {
                  time.order_dates.forEach(date=>{
                    orders_field.push({
                            id:date.id,
                            name:`${time.user.firstName} ${time.user.lastName}`,
                            field:field.name,
                            date:date.date,
                            start:time.start,
                            end:time.end,
                            status:(time.payStatus === "Paid Off")? "DiPesan" : "Perubahan Permintaan",
                            fieldN:time.order_Fields.map(({fieldChooser_id, field_chooser})=>({id:fieldChooser_id, name:field_chooser.name}))
                        });
                  })
              });
          });
          orders_field.sort((a,b)=>{
              const diffDate = moment(a.date,'YYYY-MM-DD').valueOf() - moment(b.date,'YYYY-MM-DD').valueOf();
              if(diffDate === 0){
                  return moment(a.start,'HH:mm:ss').valueOf() - moment(b.start,'HH:mm:ss').valueOf();
              }else{
                  return diffDate;
              }
          });
          setOrders([...orders_field]);
      })
  }
  }, [props])
    
  return (
    <div>
        <h1>Daftar Transaksi</h1>
        <Table bordered hover responsive>
            <thead>
                <th className='border text-center'>No</th>
                <th className='border text-center'>Atas Nama</th>
                <th className='border text-center'>Nama Lapang</th>
                <th className='border text-center'>Lapang</th>
                <th className='border text-center'>Tanggal</th>
                <th className='border text-center'>Mulai</th>
                <th className='border text-center'>Berakahir</th>
                <th className='border text-center'>Pilih</th>
            </thead>
            <tbody>
                {orders.map((data, idx)=>(
                    <tr key={data.id}>
                        <td>{idx+1}</td>
                        <td>{data.name}</td>
                        <td>{data.field}</td>
                        <td>
                            <ul>
                                {data.fieldN.map(field=><li key={field.id}>{field.name}</li>)}
                            </ul>
                        </td>
                        <td>{data.date}</td>
                        <td>{data.start}</td>
                        <td>{data.end}</td>
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

export default Transaksi