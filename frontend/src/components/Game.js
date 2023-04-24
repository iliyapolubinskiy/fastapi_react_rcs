import { useEffect, useState, useRef } from "react";
import axios from 'axios'
import GameRoom from "./GameRoom"
import {
    useToast,
    Button,
    Stack,
    FormControl,
    Input,
    useColorModeValue,
    Heading,
    Container,
    Flex,
    Text,
    Divider,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Card, CardHeader, CardBody, CardFooter,
    Spinner,
    Center,
    Box
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';

function MainMenu(props) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();
    const [roomNumber, setRoomNumber] = useState("");
    const [authHeaders, setAuthHeaders] = useState(props.authHeaders);
    const [roomAvailable, setRoomAvailable] = useState(false);
    const [error, setError] = useState({ code: null, message: null })
    const toast = useToast();
    const [myGames, setMyGames] = useState(null)
    const itemsList = { "rock": "🪨", "scissors": "✂️", "paper": "📄" }

    useEffect(() => {
        if (authHeaders !== props.authHeaders) {
            setAuthHeaders(props.authHeaders)
        }
    })

    const getMyGames = function () {
        let headers = authHeaders;
        setMyGames(null)
        axios.get(`http://${window.location.hostname}:8000/get-my-games`, headers = headers
        ).then(response => {
            console.log(response.data)
            setMyGames(response.data)
        }).catch((err) => {
            setMyGames(false)
        })
    }

    const checkRoomAvailable = function (room) {
        if (room.length > 0) {
            setError({ code: null, message: null })
            axios.get(`http://${window.location.hostname}:8000/rooms/${room}`, { authHeaders }
            ).then(response => {
                console.log(response.status, "response status")
                if (response.status === 200) {
                    setRoomAvailable(true)
                } else if (response.status !== 200) {
                    setRoomAvailable(false)
                }
            }).catch(function (error) {
                setRoomAvailable(false)
                setError({ code: error.response.status, message: error.response.data.detail })
                console.log(error.response.status)
                console.log(error.response.data.detail)
            })
        }
    }

    const handleEnterClick = function () {
        if (roomNumber.length > 0) {
            axios.get(`http://${window.location.hostname}:8000/rooms/${roomNumber}`, { authHeaders }
            ).then(response => {
                if (response.status === 200) {
                    props.enterToARoom(roomNumber)
                }
            }).catch(function (error) {
                setError({ code: error.response.status, message: error.response.data.detail })
                console.log(error.response.status)
                console.log(error.response.data.detail)
            })
        }
    }

    const createRoom = function () {
        axios.post(`http://${window.location.hostname}:8000/rooms/`, {
            authHeaders,
        }).then(response => {
            setRoomNumber(response.data.id);
            setRoomAvailable(true)
        }).then(() =>
            toast({
                title: `Room has been created!`,
                variant: "top-accent",
                isClosable: true,
            })
        )
    }

    return (
        <Flex
            minH={'100vh'}
            minW={'100vw'}
            align={'center'}
            justify={'center'}
            bg={useColorModeValue('gray.50', 'gray.800')}>
            <Container
                maxW={'xl'}
                zIndex={10}
                bg={useColorModeValue('white', 'whiteAlpha.100')}
                boxShadow={'xl'}
                rounded={'lg'}
                p={6}
                direction={'column'}>
                <Heading
                    as={'h2'}
                    fontSize={{ base: 'xl', sm: '2xl' }}
                    textAlign={'center'}
                    mb={2}>
                    Hi, {props.currentUser.email}!
                </Heading>
                <Heading
                    as={'h3'}
                    fontSize={{ base: 'lg', sm: 'xl' }}
                    textAlign={'center'}
                    mb={5}>
                    Enter to a room or create one
                </Heading>
                <Stack
                    direction={{ base: 'column', md: 'row' }}
                    as={'form'}
                    spacing={'12px'}>
                    <FormControl>
                        <Input
                            w="100%"
                            variant={'solid'}
                            borderWidth={1}
                            color={'gray.800'}
                            _placeholder={{
                                color: 'gray.400',
                            }}
                            borderColor={useColorModeValue('gray.300', 'gray.700')}
                            id={'room'}
                            type={'text'}
                            required
                            placeholder={'Room number'}
                            aria-label={'Room number'}
                            value={roomNumber}
                            onChange={(e) => { setRoomNumber(e.currentTarget.value); checkRoomAvailable(e.currentTarget.value) }}
                        />
                    </FormControl>
                    <FormControl w={{ base: '100%', md: '40%' }}>
                        <Button
                            colorScheme={roomAvailable && roomNumber.length > 0 ? 'green' : 'red'}
                            w="100%"
                            onClick={() => handleEnterClick()}
                            isDisabled={roomAvailable && roomNumber.length > 0 ? false : true}>
                            {roomAvailable && roomNumber.length > 0 ? <ArrowForwardIcon /> : 'Invalid'}
                        </Button>
                    </FormControl>
                </Stack>
                <Divider orientation='horizontal' />
                <Stack direction={"row"} w={"100%"} justifyContent={"space-between"}>
                    <Button w={"100%"} onClick={createRoom} colorScheme='teal' size='md'>
                        Create a room
                    </Button>
                    <Button px={"10"} ref={btnRef} colorScheme='teal' onClick={() => { onOpen(); getMyGames() }} size='md'>
                        View my games
                    </Button>
                </Stack>
                <Text
                    mt={2}
                    textAlign={'center'}
                    color={error.code != null ? 'red.500' : 'gray.500'}>
                    {error.code !== null
                        ? `${error.code} 😢 ${error.message}`
                        : "Good luck ✌️"}
                </Text>
            </Container>
            <Drawer
                isOpen={isOpen}
                placement='right'
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Your games</DrawerHeader>
                    <DrawerBody>
                        {myGames === null ?
                            <Center h='100px' color='white'>
                                <Spinner
                                    thickness='5px'
                                    speed='0.4s'
                                    emptyColor='gray.200'
                                    color='blue.500'
                                    size='xl'
                                />
                            </Center>
                            :
                            <Stack spacing='4'>
                                {myGames === false ?
                                    <Box>
                                        <Heading size='xs' textTransform='uppercase'>
                                            Try again
                                        </Heading>
                                        <Text pt='2' fontSize='sm'>
                                            Apparently, something went wrong. Try reloading the page. Contact us if the problem persists.
                                        </Text>
                                    </Box>
                                    :
                                    myGames.map((result, i) => (

                                        <Card variant="elevated" align='center' key={i}>
                                            <CardHeader py={"1"}>
                                                <Heading mb={"0"} size='md'> {result.is_dead_heat ? "🤝🤝🤝" : <>{result.winner.email == props.currentUser.email ? "🎉🎉🎉" : "😭😭😭"}</> }</Heading>
                                            </CardHeader>
                                            <Divider my={"1"} />
                                            <CardBody px={"0"} align='center' >
                                                <Button colorScheme='green' variant='outline' w={"100%"} size='md'>
                                                    <Text mb={"0"} m={"2"} fontSize='2xl' >{result.winner.email} {itemsList[result.winner_item]}</Text>
                                                </Button>

                                                <Text mb={"0"} fontSize='2xl'>🆚</Text>

                                                <Button colorScheme='red' variant='outline' w={"100%"} size='md'>
                                                    <Text mb={"0"} m={"2"} fontSize='2xl'>{result.loser.email} {itemsList[result.loser_item]}</Text>
                                                </Button>
                                            </CardBody>
                                            <Divider my={"1"} />
                                            <CardFooter py={"0"}>
                                                <Text as='samp'>{new Date(result.created_at).getDate()}.{new Date(result.created_at).getMonth()} at {new Date(result.created_at).getHours()}:{new Date(result.created_at).getMinutes()}</Text>
                                            </CardFooter>
                                        </Card>
                                    ))

                                }
                            </Stack>

                        }
                    </DrawerBody>

                    <DrawerFooter>
                        <Button w={"100%"} variant='outline' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Flex>

    )
}



function Game(props) {


    const [currentUser, setCurrentUser] = useState(props.currentUser);
    const [currentRoomNumber, setCurrentRoomNumber] = useState(null);
    const [authHeaders, setAuthHeaders] = useState(null);


    useEffect(() => {
        if (authHeaders != props.authHeaders) {
            setAuthHeaders(props.authHeaders)
        }
    })


    if (currentRoomNumber === null) {
        return (
            <MainMenu
                authHeaders={props.authHeaders}
                enterToARoom={(roomNumber) => setCurrentRoomNumber(roomNumber)}
                roomNumberFromProps={currentRoomNumber}
                currentUser={currentUser}>
            </MainMenu>

        )
    } else if (currentRoomNumber !== null) {
        console.log(currentRoomNumber)
        return (
            <GameRoom authHeaders={authHeaders} currentUser={currentUser} roomNumber={currentRoomNumber}></GameRoom>
        )
    }
}

export default Game;