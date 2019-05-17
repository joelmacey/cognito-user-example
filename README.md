# Cognito User Example

The Cognito User Example is a basic cognito example that deploys a user pool and user pool client and allows the user to:

* Register a User
* Verfiy the User
* Sign in as the User
* Handle Forgotten Password
* View the User's profile
* Delete the user

## Architecture

Both the Cognito User Pool and Cognito User Pool Client are created via the serverless framework and can be found in resources as a cloudformation yml file.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Cognito User Example

### Prerequisites

For this project I used
- Node version 8.10.0
- NPM version 5.6.0
- Serverless Framework version 1.39.1

### Installing

A step by step series of examples that tell you how to get a development env running

Run
```
npm install
```
in order to install all dependencies required for local development

### Deployment

Deployment is handled by the serverless framework
```
sls deploy
```
will deploy your Cognito User Pool and User Pool Client

You will need to copy the Cognito User Pool Id, **and** the User Pool Client ID into `client/js/config.js`
```
Project Root/
│
└── client/
    ├── js/
    │    └── config.js <--- Update this file
    │
    └── index.html <-- Start here to view the page

```

Once you have finished updating your config file, you should be able to register and signin on `client/index.html`

**ENJOY**
