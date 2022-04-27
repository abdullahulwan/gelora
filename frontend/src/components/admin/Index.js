import React from 'react'
import {
  Tabs,
  Tab
} from 'react-bootstrap'
import CreateFiend from './CreateFiend'
import Home from './Home'
import Setting from './Setting'
import Transaksi from './Transaksi'

function Index(props) {
  return (
    <div className='container py-5'>
      {(Object.keys(props).length>0)
      ?
      <Tabs defaultActiveKey="dashboard" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="dashboard" tabClassName="fs-3 fw-bold" title="Dasboard">
          <Home {...props} />
        </Tab>
        <Tab eventKey="list" tabClassName="fs-3 fw-bold" title="Daftar Transaksi">
          <Transaksi {...props} />
        </Tab>
        <Tab eventKey="create" tabClassName="fs-3 fw-bold" title="Create">
          <CreateFiend {...props} />
        </Tab>
        <Tab eventKey="setting" tabClassName="fs-3 fw-bold" title="Setting Lapang">
          <Setting {...props} />
        </Tab>
      </Tabs>
      :''}
    </div>
  )
}

export default Index