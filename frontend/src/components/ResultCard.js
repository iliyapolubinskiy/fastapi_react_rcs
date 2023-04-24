import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { CheckCircleIcon, CloseIcon, InfoIcon } from '@chakra-ui/icons';

export default function ResultCard(props) {

	const [myItem, setMyItem] = useState(null);
	const [opponentItem, setOpponentItem] = useState(null);


	useEffect(() => {
		if (myItem === null || opponentItem === null) {
			if (props.result.win == true) {
				setMyItem(props.result.winner_item)
				setOpponentItem(props.result.loser_item)
			} else if (props.result.win == false) {
				setMyItem(props.result.loser_item)
				setOpponentItem(props.result.winner_item)
			} else {
				setMyItem(props.result.item)
				setOpponentItem(props.result.item)
			}
		}
	});

	if (props.result.win != "no one") {
		return (
			<Box textAlign="center" py={10} px={6}>
				{props.result.win ? <CheckCircleIcon boxSize={'50px'} color={'green.500'} /> :
					<Box display="inline-block">
						<Flex
							flexDirection="column"
							justifyContent="center"
							alignItems="center"
							bg={'red.500'}
							rounded={'50px'}
							w={'55px'}
							h={'55px'}
							textAlign="center">
							<CloseIcon boxSize={'20px'} color={'white'} />
						</Flex>
					</Box>
				}
				<Heading as="h2" size="xl" mt={6} mb={2}>
					{props.result.win ? 'Congratulations!' : 'Maybe at a next time...'}
				</Heading>
				<Text color={'gray.500'}>
					Your choice is <strong>{myItem}</strong>
				</Text>
				<Text color={'gray.500'}>
					Opponents choice is <strong>{opponentItem}</strong>
				</Text>
				<Button onClick={() => window.location.reload()} colorScheme={props.result.win ? 'green' : 'red'} size='lg'>
					Play again
				</Button>
			</Box>
		);
	} else {
		return (
			<>
				<Box textAlign="center" py={10} px={6}>
					<InfoIcon boxSize={'50px'} color={'blue.500'} />
					<Heading as="h2" size="xl" mt={6} mb={2}>
						Dead heat!
					</Heading>
					<Text color={'gray.500'}>
						You and your opponent have chosen <strong>{myItem}</strong>
					</Text>
				</Box>
				<Button onClick={() => window.location.reload()} colorScheme='blue' size='lg'>
					Play again
				</Button>
			</>
		);
	}
}