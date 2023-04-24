import React, { useState, useEffect } from 'react';
import {
  MDBBtn,
}
from 'mdb-react-ui-kit';

function LoginViaVK() {

  

    // eslint-disable-next-line
    const [code, setCode] = useState(0)
    
    // eslint-disable-next-line
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setCode(params.get("code"))
        params.delete("code")
        if (code) {
            loginRequest()
        }
    })

    const params = {
        client_id: 51554511,
        redirect_uri: "http://localhost:8000/",
        scope:"email, first_name, last_name",
        response_type:"code",
    }


    const getCode = () => {
        window.location.href = `https://oauth.vk.com/authorize?client_id=${params.client_id}&redirect_uri=${params.redirect_uri}&scope=${params.scope}&response_type=${params.response_type}`; 
    }    

    const loginRequest = async () => {
        if (code) {
            fetch(`VKAuth?code=${code}`, {method: 'GET'})
              .then(response => response.json())
              .then(response => {
                if (response["code"] === 1) {
                    window.location.href = params.redirect_uri
              }
            })
        }
    }

    return (
        <>
            <MDBBtn onClick={getCode} className='mb-2 fs-5 w-100 py-2'>Sign in via <strong>VK</strong></MDBBtn>
        </>
    )
}

export default LoginViaVK;