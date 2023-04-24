import { useEffect, useState } from "react";
import ResultCard from "./ResultCard";
import {
	Stack,
	Button,
	Heading,
	Container,
	Flex,
	Divider,
	Text,
	CircularProgress,
	CircularProgressLabel,
	Spinner,
	HStack,
	Icon,
	Box, 
	Tooltip
} from '@chakra-ui/react';

import { CheckCircleIcon, } from '@chakra-ui/icons'
import rock_img from "../images/stone.png";
import paper_img from "../images/paper.png";
import scissors_img from "../images/scissor.png";


function GameRoom(props) {

	const [currentUser, setCurrentUser] = useState(props.currentUser);
	const [roomNumber, setRoomNumber] = useState(props.roomNumber);
	const [connections, setConnections] = useState(0);
	const [websocket, setWebsocket] = useState(null);
	const [myStatus, setMyStatus] = useState(false);
	const [opponentStatus, setOpponentStatus] = useState(false);
	const [gameStarted, isGameStarted] = useState(false);
	const [gameEnded, isGameEnded] = useState(false);
	const [myChoice, setMyChoice] = useState("rock");
	const [countDown, setCountDown] = useState(100);
	const [readyBtnActive, setReadyBtnActive] = useState(true);
	const [result, setResult] = useState(null);
	const [authHeaders, setAuthHeaders] = useState(props.authHeaders);

	const CircleIcon = (props) => (
		<Icon viewBox='0 0 200 200' {...props}>
			<path
				fill='currentColor'
				d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
			/>
		</Icon>
	)

	useEffect(() => {
		if (websocket === null) {
			setWebsocket(new WebSocket(`ws://${window.location.hostname}:8000/ws/${roomNumber}`))
		}
		if (authHeaders != props.authHeaders) {
			setAuthHeaders(props.authHeaders)
		}
		if (gameStarted === true && countDown !== 0) {
			const timer = setInterval(() => {
				setCountDown((prevProgress) => (prevProgress == 0 ? 0 : prevProgress - 10));
			}, 1000);
			return () => {
				clearInterval(timer);
			};
		} else if (countDown == 0 && gameStarted === true) {
			onGameOver()
		}
	}, [websocket, countDown, gameStarted, roomNumber])


	function onGameOver() {
		isGameStarted(false)
		isGameEnded(true)
		setReadyBtnActive(false)
		websocket.send(JSON.stringify({ result: myChoice, user: currentUser }))
		console.log(JSON.stringify({ result: myChoice, user: currentUser }))
	}


	if (websocket !== null) {
		websocket.onclose = function (event) {
			if (event.wasClean) {
				console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
			} else {
				// например, сервер убил процесс или сеть недоступна
				// обычно в этом случае event.code 1006
				console.log('[close] Соединение прервано', event);
			}
		};

		websocket.onopen = (event) => {
			console.log(event, "connect")
		}

		const addConnection = function (digit) {
			setConnections(digit)
		}

		websocket.onmessage = function (event) {
			let data = JSON.parse(event.data)
			if (data.connections) {
				addConnection(data.connections)
			}
			if (data.command) {
				let command = data.command
				if (command == "update_opponent_status") {
					setOpponentStatus(data.opponent_status)
				} if (command == "start") {
					isGameStarted(true)
				} if (command == "get_game_info") {
					websocket.send(
						JSON.stringify({
							"game_result": {
								"room_number": roomNumber,
								"user_info": currentUser.id,
								"result": JSON.stringify(result),
							}
						})
					)
				}
			}
			if (data.result) {
				setResult(data.result)
				console.log(data.result)
				console.log(result)
			}
		}
	}

	function sendMyStatus(status) {
		if (websocket !== null) {
			websocket.send(JSON.stringify({ "command": status }))
			setMyStatus(!myStatus)
		}
	}

	if (result == null) {
		return (
			<Flex
				minH={'100vh'}
				minW={'100vw'}
				align={'center'}
				justify={'center'}
				bg='gray.50'>
				<Container
					maxW={'lg'}
					bg={'white'}
					boxShadow={'xl'}
					rounded={'lg'}
					p={6}
					direction={'column'}>
					<Stack zIndex={10} direction='row' align='center' justify={"space-between"}>
						<Text m={0} as='samp'>
							room#{roomNumber}
						</Text>
						<Button colorScheme='teal' size='sm' onClick={() => window.location.reload()}>
							Go back
						</Button>
					</Stack>
					<Divider mb={`1`}></Divider>
					<Container centerContent>
					<Tooltip label={connections == 2 ? "Both players joined" : "One of the two players has not yet joined"} closeOnClick={false}>
						<Button colorScheme='gray' mb={'2'} isActive={false}>
							<Stack direction="row" justify={'center'} align='center'>
								<CircleIcon boxSize={5} color='green.500' as={CheckCircleIcon} />
								{connections === 2 ? 
								<CircleIcon boxSize={5} color='green.500' as={CheckCircleIcon} />
								:
								<Spinner
									thickness='10px'
									speed='0.5s'
									emptyColor='green.200'
									color='red.200'
									size=''
								/>
							}
							</Stack>
						</Button>
						</Tooltip>
						<Box>
							{connections === 2 ?
								<>
									<Heading size='xs' textAlign={`center`} textTransform='uppercase'>
										Both players joined
									</Heading>
									<Text pt='2' textAlign={`center`} fontSize='sm'>
										When you're ready, set the status to "ready" and select the item.
									</Text>
								</>
								:
								<>
									<Heading size='xs' textAlign={`center`} textTransform='uppercase'>
										It's not all there yet.
									</Heading>
									<Text pt='2' textAlign={`center`} fontSize='sm'>
										We are waiting for the second player to join.
									</Text>
								</>
							}
						</Box>
					</Container>
				<Stack
					direction={{ base: 'column', md: 'row' }}
					as={'form'}
					spacing={'12px'}
				>
					<div className="container d-flex flex-column justify-content-center align-items-center">
						<h1 className={gameStarted ? "fs-1" : "fs-1 d-none"}>
							<CircularProgress size='120px' value={countDown}>
								<CircularProgressLabel>{countDown / 10}</CircularProgressLabel>
							</CircularProgress>
						</h1>
						<div className="row">
							<div className="btn-group px-0" role="group" aria-label="Take your item">
								<input
									onChange={(e) => setMyChoice(e.currentTarget.id)}
									type="radio"
									className="btn-check"
									name="options"
									id="rock"
									autoComplete="off"
									defaultChecked disabled={gameStarted ? false : false}>
								</input>
								<label className={myChoice === "rock" ? "btn btn-success rounded-start" : "btn btn-outline-dark rounded-start"} htmlFor="rock">
									<img
										src={rock_img}
										width="100px"
									/>
								</label>

								<input
									onChange={(e) => setMyChoice(e.currentTarget.id)}
									type="radio"
									className="btn-check"
									name="options"
									id="scissors"
									autoComplete="off"
									disabled={gameStarted ? false : false}>
								</input>
								<label className={myChoice === "scissors" ? "btn btn-success" : "btn btn-outline-dark"} htmlFor="scissors">
									<img
										src={scissors_img}
										width="100px"
									/>
								</label>

								<input
									onChange={(e) => setMyChoice(e.currentTarget.id)}
									type="radio"
									className="btn-check"
									name="options"
									id="paper"
									autoComplete="off"
									disabled={gameStarted ? false : false}>
								</input>
								<label className={myChoice === "paper" ? "btn btn-success" : "btn btn-outline-dark"} htmlFor="paper">
									<img
										src={paper_img}
										width="100px"
									/>
								</label>
							</div>
						</div>

						<Divider></Divider>
						<div className="row mt-2">
							<Stack direction='row'>
								<Button
									colorScheme={myStatus ? 'green' : 'red'}
									w="100%"
									id="myStatus"
									onClick={() => sendMyStatus(myStatus ? "not ready" : "ready")}
									isDisabled={gameStarted & readyBtnActive ? true : false}>
									{myStatus ? "ready" : "not ready"}
								</Button>
							</Stack>
						</div>
						<div className="row mt-2">
							<span
								className={opponentStatus ? 'col-12 badge badge-success' : "col-12 badge badge-danger"}>
								<small>Your opponent is </small><strong>{opponentStatus ? "ready" : "not ready"}</strong>
							</span>
						</div>
					</div>
				</Stack>
			</Container>
			</Flex >
		)
	} else {
		return (
			<div className="container d-flex flex-column justify-content-center align-items-center">
				<ResultCard result={result}></ResultCard>
			</div>
		)
	}
}

export default GameRoom;