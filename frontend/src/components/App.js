// eslint-disable-next-line
import logo from '../images/logo.svg';
import '../styles/App.css';
import AuthForm from './AuthForm'
import Game from './Game'
import SecondForm from './SecondForm'
import axios from 'axios'
import { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import { Center, Square, Circle } from '@chakra-ui/react'


function App() {

	const [authStatus, setAuthStatus] = useState(null);
	const [authenticated, isAuthenticated] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);
	const [authHeaders, setAuthHeaders] = useState(null);

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

	const getToken = function () {
		if (getCookie("header_payload") != null && getCookie("signature") != null) {
			return getCookie("header_payload") + "." + getCookie("signature")
		} else {
			return null
		}
	}

	useEffect(() => {
		if (authStatus === null) {
			getUser()
		}
	})


	const getUser = function () {
		console.log("getUser()")
		let token = getToken()
		if (token != null) {
			let headers = {
				headers: {
					"Authorization": `Bearer ${token}`
				}
			}
			axios.get(`http://${window.location.hostname}:8000/users/me/`, headers = headers
			).then(response => {
				console.log(response)
				setAuthStatus(response.status)
				setCurrentUser(response.data)
				isAuthenticated(response.status === 200 ? true : false)
				setAuthHeaders(headers)
			}).catch(function (error) {
				console.log(error, "this is errors")
			})
		}
	}

	if (authenticated === true) {
		return (
			<ChakraProvider>
				<Game authHeaders={authHeaders} currentUser={currentUser}></Game>
			</ChakraProvider>
		)
	} else if (authenticated === false && authStatus !== 200) {
		return (
			<ChakraProvider>
				  	<Center w='100%' h='100%'>
						<AuthForm loggedIn={getUser}></AuthForm>
  					</Center>
			</ChakraProvider>
		);
	};
}

export default App;
