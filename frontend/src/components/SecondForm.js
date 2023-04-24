import React, { useEffect, useState } from 'react';
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBInput,
  MDBTypography,
}
from 'mdb-react-ui-kit';
import axios from "axios"

function SecondForm() {

    const [login, setLogin] = useState();
    const [password, setPassword] = useState();

    const makeLogin = async () => {
        let formData = new FormData()
        formData.append("username", login)
        formData.append("password", password)
        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        axios.post("http://localhost:8000/token", formData, headers,
        ).then(result => {console.log(result)})
    }

    return (
        <div className='auth-container d-flex w-100 justify-content-center align-items-center text center'>
            <MDBInput className='mt-2' label='Username' id='form0Field1' onChange={(e) => setLogin(e.target.value)} value={login} type='text'/>
            <MDBInput className='mt-2' label='Password' id='form0Field2' onChange={(e) => setPassword(e.target.value)} value={password} type='password'/>
            <button className="mt-3" onClick={makeLogin}>Sign in</button>
        </div>
    
      );
}

export default SecondForm;