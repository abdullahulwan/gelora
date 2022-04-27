import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import { sendPostToken } from '../Logic/GetRequest';
import moment from 'moment'
import { Table } from 'react-bootstrap';

const TableData = (props) =>{
    return(
        <Table bordered hover responsive>
            <thead>
                <th className='border text-center'>No</th>
                <th className='border text-center'>Atas Nama</th>
                <th className='border text-center'>Nama Lapang</th>
                <th className='border text-center'>Lapang</th>
                <th className='border text-center'>Tanggal</th>
                <th className='border text-center'>Mulai</th>
                <th className='border text-center'>Berakahir</th>
            </thead>
            <tbody>
                {props.data.map((data, idx)=>(
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
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

function Home(props) {
    const [todayOrder, setTodayOrder] = useState([]);
    const [tomorrowOrder, setTomorrowOrder] = useState([]);
    const [soonOrder, setSoonOrder] = useState([])
    useEffect(() => {
    if(Object.keys(props).length>0){
        sendPostToken('/owner/order/list',{id:props.id}, props.token)
        .then(response=>{
            const today_order = [];
            const tomorrow_order = [];
            const soon_order = [];
            const today = moment().startOf('day').valueOf();
            const tomorrow = moment().add(1,'days').startOf('day').valueOf();
            response.forEach(field => {
                field.order_Times.forEach(time => {
                    time.order_dates.forEach(date=>{
                        const elmDate = moment(date.date,'YYYY-MM-DD').valueOf();
                        const data = {
                                id:date.id,
                                name:`${time.user.firstName} ${time.user.lastName}`,
                                field:field.name,
                                date:date.date,
                                start:time.start,
                                end:time.end,
                                fieldN:time.order_Fields.map(({fieldChooser_id, field_chooser})=>({id:fieldChooser_id, name:field_chooser.name}))
                            };
                        if(elmDate === today){
                            today_order.push(data);
                        }else if(elmDate === tomorrow){
                            tomorrow_order.push(data);
                        }else if(elmDate > tomorrow){
                            soon_order.push(data);
                        }
                    })
                });
            });
            today_order.sort((a,b)=>{
                return moment(a.start,'HH:mm:ss').valueOf() - moment(b.start,'HH:mm:ss').valueOf()
            })
            tomorrow_order.sort((a,b)=>{
                return moment(a.start,'HH:mm:ss').valueOf() - moment(b.start,'HH:mm:ss').valueOf()
            })
            soon_order.sort((a,b)=>{
                const diffDate = moment(a.date,'YYYY-MM-DD').valueOf() - moment(b.date,'YYYY-MM-DD').valueOf();
                if(diffDate === 0){
                    return moment(a.start,'HH:mm:ss').valueOf() - moment(b.start,'HH:mm:ss').valueOf();
                }else{
                    return diffDate;
                }
            })
            setTodayOrder([...today_order]);
            setTomorrowOrder([...tomorrow_order]);
            setSoonOrder([...soon_order]);
        })
    }
    }, [props])
    
  return (
    <div>
        {(todayOrder.length>0)? 
            <div className='mb-5'>
                <h4 className='border-bottom pb-1'>Yang akan Datang Hari ini</h4>
                <TableData data={todayOrder} />
            </div>
        : ''}
        {(tomorrowOrder.length>0)? 
            <div className='mb-5'>
                <h4 className='border-bottom pb-1'>Yang akan Datang Besok</h4>
                <TableData data={tomorrowOrder} />
            </div>
        : ''}
        {(soonOrder.length>0)? 
            <div className='mb-5'>
                <h4 className='border-bottom pb-1'>Yang akan Datang</h4>
                <TableData data={soonOrder} />
            </div>
        : ''}
    </div>
  )
}

export default Home