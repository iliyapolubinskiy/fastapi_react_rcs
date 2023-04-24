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
import axios from "axios";

function AuthForm(props) {

  const [justifyActive, setJustifyActive] = useState('tab1');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');

  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [unLenValid, setUnLenValid] = useState();
  const [unCharsValid, setUnCharsValid] = useState();
  const [pwLenValid, setPwLenValid] = useState()
  const [pwCharsValid, setPwCharsValid] = useState();
  const [pw2Valid, setPw2Valid] = useState();
  const [fnLenValid, setFnLenValid] = useState();
  const [fnCharsValid, setFnCharsValid] = useState();
  const [lnLenValid, setLnLenValid] = useState();
  const [lnCharsValid, setLnCharsValid] = useState();

  const [isRegDisabled, setRegDisabled] = useState(true);
  const [isLogDisabled, setLogDisabled] = useState(true);

  const [isErrorLogin, setErrorLogin] = useState(null);
  const [isErrorReg, setErrorReg] = useState(null);

  // eslint-disable-next-line
  useEffect(() => {
    if (login.length > 0 && password.length > 0) {
      setLogDisabled(false)
    } else {
      setLogDisabled(true)
    }

    const usernameChars = new RegExp('^[a-zA-Z0-9_.-]*$')
    setUnCharsValid(usernameChars.test(username))
    if (username.length < 4 || username.length > 20 ) {
        setUnLenValid(false) 
      } else {
      setUnLenValid(true)
    }

    const passwordChars = new RegExp('^[a-zA-Z0-9_.!"№;:?*@#$%&*^()-]*$')
    setPwCharsValid(passwordChars.test(password1))
    if ( password1.length < 8 ) {
        setPwLenValid(false) 
      } else {
      setPwLenValid(true)
    }

    if ( password1 !== password2 ) {
      setPw2Valid(false)
    } else {
      setPw2Valid(true)
    }

    const namesChars = new RegExp('^[a-zA-Zа-яА-Я]*$')
    setFnCharsValid(namesChars.test(firstName))
    setLnCharsValid(namesChars.test(lastName))

    if ( firstName.length < 2 || firstName.length > 20 ) {
      setFnLenValid(false)
    } else {
      setFnLenValid(true)
    }

    if ( lastName.length < 2 || lastName.length > 20 ) {
      setLnLenValid(false)
    } else {
      setLnLenValid(true)
    }

    let validStates = [unCharsValid, unLenValid, pwLenValid, pwCharsValid, pw2Valid, fnCharsValid, fnLenValid, lnCharsValid, lnLenValid]
    let checker = arr => arr.every(v => v === true);
    setRegDisabled(!checker(validStates))
  })


  const getCookie = function (name) {
    if (!document.cookie) {
      return null;
    }
  
    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith(name + '='));
  
    if (xsrfCookies.length === 0) {
      return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
  }

  const getTokenFromCookie = function() {
    return getCookie("header_payload") + "." + getCookie("signature") 
  }

  const setCookies = function(token, isSuccess) {
    if (isSuccess === true) {
      let token_array = token.split(".")
      let header_payload = token_array.slice(0, 2).join(".")
      let signature = token_array.slice(2).join()
      console.log(signature, "signature")
      document.cookie = `signature=${signature}; secure;`
      document.cookie = `header_payload=${header_payload}; secure; max_age=1800;`
    } else {
      document.cookie = `signature=0; secure; max_age=-1;`
      document.cookie = `header_payload=0; secure; max_age=-1;`
    }
  }


  const handleClick = async () => {
    let formData = new FormData()
    formData.append("username", login)
    formData.append("password", password)
    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    axios.post("http://localhost:8000/token", formData, headers,
    ).then(result => {
      if (result.data.access_token) {
        setCookies(result.data.access_token, true)
        props.loggedIn()
      }
      console.log(result.data)
    }).catch(function (error) {
      if (error.response) {
        setCookies("false", false)
        setErrorLogin(error.response.data.detail)
      }})
  }

  const handleSignUp = async () => {
    axios.post("http://localhost:8000/users/", { 
        email: username, 
        password1: password1, 
        password2: password2, 
        first_name: firstName, 
        last_name: lastName 
      }
    ).then(response => console.log(response)
    ).catch(function (error) {
      if (error.response) {
        setErrorReg(error.response.data.detail)
      }})
  }

  const handleJustifyClick = (value) => {
    if (value === justifyActive) {
      return;
    }
    setJustifyActive(value);
  };

  return (
    <div className='auth-container d-flex w-100 justify-content-center align-items-center text center'>
      <MDBContainer className="mdb-container text-center p-3 my-5 d-flex flex-column d-flex bg-light text-dark">

        <MDBTabs pills justify className='d-flex flex-row justify-content-between'>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
              Login
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
              Register
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent>

          <MDBTabsPane show={justifyActive === 'tab1'}>
            
            <MDBInput className='mt-2' label='Username' id='form0Field1' onChange={(e) => setLogin(e.target.value)} value={login} type='text'/>
            <MDBInput className='mt-2' label='Password' id='form0Field2' onChange={(e) => setPassword(e.target.value)} value={password} type='password'/>
            {isErrorLogin !== null && 
              <MDBTypography className='mt-2' note noteColor='danger'>
                <strong>Ошибка авторизации.</strong> {isErrorLogin}
              </MDBTypography>
            }
            <button className={isLogDisabled ? "disabled btn btn-primary mt-3" : "btn btn-primary mt-3"} onClick={handleClick}>Sign in</button>

          </MDBTabsPane>

          <MDBTabsPane show={justifyActive === 'tab2'}>

            <MDBInput className='mt-2' label='Username' id='form1Field1' onChange={(e) => setUsername(e.target.value)} value={username} type='text'/>
            {(unLenValid === false && username.length !== 0) && <p className='text-danger my-0'><small>Username length must be 4-20</small></p>}
            {(unCharsValid === false && username.length !== 0) && <p className='text-danger my-0'><small>Username contains invalid characters</small></p>}
            <MDBInput className='mt-2' label='First name' id='form1Field4' onChange={(e) => setFirstName(e.target.value)} value={firstName} type='text'/>
            {(fnLenValid === false && firstName.length !== 0) && <p className='text-danger my-0'><small>First name length must be 2-20</small></p>}
            {(fnCharsValid === false && firstName.length !== 0) && <p className='text-danger my-0'><small>First name contains invalid characters</small></p>}
            <MDBInput className='mt-2' label='Last name' id='form1Field5' onChange={(e) => setLastName(e.target.value)} value={lastName} type='text'/>
            {(lnLenValid === false && lastName.length !== 0) && <p className='text-danger my-0'><small>Last name length must be 2-20</small></p>}
            {(lnCharsValid === false&& lastName.length !== 0) && <p className='text-danger my-0'><small>Last name contains invalid characters</small></p>}
            <MDBInput className='mt-2' label='Password' id='form1Field2' onChange={(e) => setPassword1(e.target.value)} value={password1} type='password'/>
            {(pwLenValid === false && password1.length !== 0) && <p className='text-danger my-0'><small>Password length must be mopre than 8</small></p>}
            {(pwCharsValid === false && password1.length !== 0) && <p className='text-danger my-0'><small>Password contains invalid characters</small></p>}
            <MDBInput className='mt-2' label='Repeat password' id='form1Field3' onChange={(e) => setPassword2(e.target.value)} value={password2} type='password'/>
            {(pw2Valid === false && password2.length !== 0) && <p className='text-danger my-0'><small>Passwords must match</small></p>}
            {isErrorReg !== null && 
              <MDBTypography note className='mt-2' noteColor='danger'>
                <strong>Ошибка регистрации.</strong> {isErrorReg}
              </MDBTypography>
            }
            <button className={isRegDisabled ? "disabled btn btn-primary mt-3" : "btn btn-primary mt-3"} onClick={handleSignUp}>Sign up</button>

          </MDBTabsPane>

        </MDBTabsContent>

      </MDBContainer>      
    </div>

  );
}

export default AuthForm;