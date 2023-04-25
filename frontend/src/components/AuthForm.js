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
import {
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Stack,
	FormLabel,
	FormControl,
	Input,
	Checkbox,
	Link,
	Button,
	Flex,
	Box,
	Heading,
	useColorModeValue,
	HStack,
	InputGroup,
	Text,
	InputRightElement
} from '@chakra-ui/react';
import { ViewOffIcon, ViewIcon } from "@chakra-ui/icons";

function AuthForm(props) {

	const [showPassword, setShowPassword] = useState(false);

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
		if (username.length < 4 || username.length > 20) {
			setUnLenValid(false)
		} else {
			setUnLenValid(true)
		}

		const passwordChars = new RegExp('^[a-zA-Z0-9_.!"№;:?*@#$%&*^()-]*$')
		setPwCharsValid(passwordChars.test(password1))
		if (password1.length < 8) {
			setPwLenValid(false)
		} else {
			setPwLenValid(true)
		}

		if (password1 !== password2) {
			setPw2Valid(false)
		} else {
			setPw2Valid(true)
		}

		const namesChars = new RegExp('^[a-zA-Zа-яА-Я]*$')
		setFnCharsValid(namesChars.test(firstName))
		setLnCharsValid(namesChars.test(lastName))

		if (firstName.length < 2 || firstName.length > 20) {
			setFnLenValid(false)
		} else {
			setFnLenValid(true)
		}

		if (lastName.length < 2 || lastName.length > 20) {
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

	const getTokenFromCookie = function () {
		return getCookie("header_payload") + "." + getCookie("signature")
	}

	const setCookies = function (token, isSuccess) {
		if (isSuccess === true) {
			let token_array = token.split(".")
			let header_payload = token_array.slice(0, 2).join(".")
			let signature = token_array.slice(2).join()
			console.log(signature, "signature")
			document.cookie = `signature=${signature}; `
			document.cookie = `header_payload=${header_payload}; max_age=86400;`
		} else {
			document.cookie = `signature=0; secure; max_age=-1;`
			document.cookie = `header_payload=0; secure; max_age=-1;`
		}
	}


	const loginIn = async (loginText, passwordText) => {
		let formData = new FormData()
		formData.append("username", loginText)
		formData.append("password", passwordText)
		const headers = {
			'accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		axios.post(`http://${window.location.hostname}:8000/token`, formData, headers,
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
				console.log(error)
			}
		})
	}


	const handleClick = async () => {
		let formData = new FormData()
		formData.append("username", login)
		formData.append("password", password)
		const headers = {
			'accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		axios.post(`http://${window.location.hostname}:8000/token`, formData, headers,
		).then(result => {
			console.log(result)
			if (result.data.access_token) {
				setCookies(result.data.access_token, true)
				props.loggedIn()
			}
			console.log(result.data)
		}).catch(function (error) {
			if (error.response) {
				setCookies("false", false)
				setErrorLogin(error.response.data.detail)
			}
		})
	}

	const handleSignUp = async () => {
		axios.post(`http://${window.location.hostname}:8000/users/`, {
			email: username,
			password1: password1,
			password2: password2,
			first_name: firstName,
			last_name: lastName
		}
		).then(response => {
			if (response.status == 200) {
				loginIn(username, password1)
				console.log(response);
			}
		}
		).catch(function (error) {
			if (error.response) {
				console.log(error)
				setErrorReg(error.response.data.detail)
			}
		})
	}

	return (
		<Flex
			minH={'100vh'}
			minW={'100vw'}
			align={'center'}
			justify={'center'}
			bg={useColorModeValue('gray.50', 'gray.800')}>
			<Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} zIndex={10}>
				<Tabs variant='soft-rounded' colorScheme='green'>
					<Stack align={'center'}>
						<Heading fontSize={'4xl'}>Sign in to your account</Heading>
						<TabList>
							<Tab mx={2}>Login</Tab>
							<Tab mx={2}>Create account</Tab>
						</TabList>
					</Stack>
					<TabPanels>
						<TabPanel>
							<Box
								rounded={'lg'}
								bg={useColorModeValue('white', 'gray.700')}
								boxShadow={'lg'}
								p={8}>
								<Stack spacing={4}>
									<FormControl id="email">
										<FormLabel>Username</FormLabel>
										<Input type="email" label='Username' id='form0Field1' onChange={(e) => setLogin(e.target.value)} value={login} />
									</FormControl>
									<FormControl id="password">
										<FormLabel>Password</FormLabel>
										<Input type="password" label='Password' id='form0Field2' onChange={(e) => setPassword(e.target.value)} value={password} />
									</FormControl>
									<Stack>
										{isErrorLogin !== null &&
											<MDBTypography className='mt-2' note noteColor='danger'>
												<strong>Ошибка авторизации.</strong> {isErrorLogin}
											</MDBTypography>
										}
									</Stack>
									<Stack spacing={10}>
										<Stack
											direction={{ base: 'column', sm: 'row' }}
											align={'start'}
											justify={'space-between'}>
											<Checkbox>Remember me</Checkbox>
											<Link color={'blue.400'}>Forgot password?</Link>
										</Stack>
										<Button
											id='signin-button'
											isDisabled={isLogDisabled}
											onClick={handleClick}
											bg={'blue.400'}
											color={'white'}
											_hover={{
												bg: 'blue.500',
											}}>
											Sign in
										</Button>
									</Stack>
								</Stack>
							</Box>
						</TabPanel>
						<TabPanel>
							<Box
								rounded={'lg'}
								bg={useColorModeValue('white', 'gray.700')}
								boxShadow={'lg'}
								p={8}>
								<Stack spacing={4}>
									<HStack>
										<Box>
											<FormControl id="firstName" isRequired>
												<FormLabel>First Name</FormLabel>
												<Input id='form1Field4' onChange={(e) => setFirstName(e.target.value)} value={firstName} type="text" />
											</FormControl>
										</Box>
										<Box>
											<FormControl id="lastName" isRequired>
												<FormLabel>Last Name</FormLabel>
												<Input id='form1Field5' onChange={(e) => setLastName(e.target.value)} value={lastName} type="text" />
											</FormControl>
										</Box>
									</HStack>
									{(fnLenValid === false && firstName.length !== 0) && <p className='text-danger my-0'><small>First name length must be 2-20</small></p>}
									{(fnCharsValid === false && firstName.length !== 0) && <p className='text-danger my-0'><small>First name contains invalid characters</small></p>}
									{(lnLenValid === false && lastName.length !== 0) && <p className='text-danger my-0'><small>Last name length must be 2-20</small></p>}
									{(lnCharsValid === false && lastName.length !== 0) && <p className='text-danger my-0'><small>Last name contains invalid characters</small></p>}
									<FormControl id="username" isRequired>
										<FormLabel>Username</FormLabel>
										<Input label='Username' id='form1Field1' onChange={(e) => setUsername(e.target.value)} value={username} type="text" />
										{(unLenValid === false && username.length !== 0) && <p className='text-danger my-0'><small>Username length must be 4-20</small></p>}
										{(unCharsValid === false && username.length !== 0) && <p className='text-danger my-0'><small>Username contains invalid characters</small></p>}
									</FormControl>
									<FormControl id="password" isRequired>
										<FormLabel>Password</FormLabel>
										<InputGroup>
											<Input label='Password' id='form1Field2' onChange={(e) => setPassword1(e.target.value)} value={password1} type={showPassword ? 'text' : 'password'} />
											<InputRightElement h={'full'}>
												<Button
													variant={'ghost'}
													onClick={() =>
														setShowPassword((showPassword) => !showPassword)
													}>
													{showPassword ? <ViewIcon /> : <ViewOffIcon />}
												</Button>
											</InputRightElement>
										</InputGroup>
										{(pwLenValid === false && password1.length !== 0) && <p className='text-danger my-0'><small>Password length must be mopre than 8</small></p>}
										{(pwCharsValid === false && password1.length !== 0) && <p className='text-danger my-0'><small>Password contains invalid characters</small></p>}
									</FormControl>
									<FormControl id="password" isRequired>
										<FormLabel>Repeat Password</FormLabel>
										<InputGroup>
											<Input label='Repeat password' id='form1Field3' onChange={(e) => setPassword2(e.target.value)} value={password2} type={showPassword ? 'text' : 'password'} />
											<InputRightElement h={'full'}>
											</InputRightElement>
										</InputGroup>
										{(pw2Valid === false && password2.length !== 0) && <p className='text-danger my-0'><small>Passwords must match</small></p>}
									</FormControl>
									<Stack spacing={10} pt={2}>
										{isErrorReg !== null &&
											<MDBTypography note className='mt-2' noteColor='danger'>
												<strong>Ошибка регистрации.</strong> {isErrorReg}
											</MDBTypography>
										}
										<Button
											id='signup-button'
											isDisabled={isRegDisabled}
											loadingText="Submitting"
											onClick={handleSignUp}
											size="lg"
											bg={'blue.400'}
											color={'white'}
											_hover={{
												bg: 'blue.500',
											}}>
											Sign up
										</Button>
									</Stack>
									<Stack pt={6}>
										<Text align={'center'}>
											Already a user? <Link color={'blue.400'}>Login</Link>
										</Text>
									</Stack>
								</Stack>
							</Box>
						</TabPanel>
					</TabPanels>
				</Tabs>

			</Stack>
		</Flex>


	);
}

export default AuthForm;