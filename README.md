# hackh-broadcast-node

tool to empower Cambodia to contain the spread of COVID-19 in the cities and provinces. It Enable the government to have a 1 single source of truth to its citizens, on daily COVID-19 containment news, policies and other civic guidelines. 


## Setup

1. installation command `npm install`
2. starting command `npm start` it is using `8081` port by default

## Telegram 

Join the test channel https://t.me/hackh_broadcast

```
	POST: https://zwrqt3cve3.execute-api.ap-southeast-1.amazonaws.com/dev/api/telegram
	body: {
		"text": "*COVID-19: Reusable masks for all residents*  Wear a mask if you are out and in close contact with others  - Theres possibility of undetected cases in the community  - some evidence that infected persons with no symptoms can pass the virus"
	}
````

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
