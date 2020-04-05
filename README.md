# hackh-broadcast-node

tool to empower Cambodia to contain the spread of COVID-19 in the cities and provinces. It Enable the government to have a 1 single source of truth to its citizens, on daily COVID-19 containment news, policies and other civic guidelines. 


## Setup

1. installation command `npm install`
2. starting command `npm start` it is using `8081` port by default

## Auth

Request for verification code. OTP will be sent to your provided phone number.
>Phone Number must be a string +85589******

```
POST: https://zwrqt3cve3.execute-api.ap-southeast-1.amazonaws.com/dev/api/auth

body: {
	"phone": "+85589******"
}

response {
	"statusCode": 200,
	"body": {
		message
	}
}
```

Request for customToken
>Phone must be a string +85589******
>Code must be 6 digit string ******
```
POST: https://zwrqt3cve3.execute-api.ap-southeast-1.amazonaws.com/dev/api/auth

body: {
	"phone": "+85589******",
	"code": "******"
}

response {
	"statusCode": 200,
	"body": {
		"data": {
			customeToken
		}
	}
}
``` 

## Telegram 

Join the test channel https://t.me/hackh_broadcast
>You can use direct `text` or specific firebase `messageId` to send the message

```
	POST: https://zwrqt3cve3.execute-api.ap-southeast-1.amazonaws.com/dev/api/telegram
	headers: {
		Authorization: 'Bearer FIREBASE_ID_TOKEN'
	}
	body: {
		"text": "*COVID-19: Reusable masks for all residents*  Wear a mask if you are out and in close contact with others  - Theres possibility of undetected cases in the community  - some evidence that infected persons with no symptoms can pass the virus",
		"messageId": "randomMessageId1"
	}
````

## Messenger 

Join the test chat by saying hi https://m.me/113306183658091
>You can use direct `text` or specific firebase `messageId` to send the message

```
	POST: https://zwrqt3cve3.execute-api.ap-southeast-1.amazonaws.com/dev/api/messenger
	headers: {
		Authorization: 'Bearer FIREBASE_ID_TOKEN'
	}
	body: {
		"text": "*COVID-19: Reusable masks for all residents*  Wear a mask if you are out and in close contact with others  - Theres possibility of undetected cases in the community  - some evidence that infected persons with no symptoms can pass the virus",
		"messageId": "randomMessageId1"
	}
````

## Extras

### Client authorization

```javascript
	
	firebase.initializeApp({
	  apiKey: "AIzaSyDVT7hjCcB-mi3a-q4A7XZvbkGgc8z4Q5w",      // Auth / General Use
	  databaseURL: "https://hackh-broadcast.firebaseio.com",  // Realtime Database
	  storageBucket: "hackh-broadcast.appspot.com"            // Storage
	})

	const auth = firebase.auth()
	await auth.signInWithCustomToken(CUSTOM_TOKEN)
	const token = await auth.currentUser.getIdTokenResult()

  firebase.database().ref('telegram').on('value', snapshot => {
    const messages = []
    snapshot.forEach(child => messages.push(child.val()))
    // it should trigger every time there are some changes happening
    console.log(messages)
  })
```