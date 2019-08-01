# NodeJS Seed Project

To quickly bootstrapping any future projects, this seed project includes all common part in all of my other private project

## Table of Contents
- [Feature](#feature)
- [Requirements](#requirements)
- [Setup](#setup)
- [Documents](#documents)

## Feature
 
- Basic Restful APIs:
  - Authentication
  - Authorization using HRBAC
  - User managing
- Helper function for micro-service architecture
- Swagger document
- Unit tests with test coverage report
- Docker integrated

## Requirements

- NodeJS 8.10
- MySQL 5.7:
  - User: 'root'
  - Password: none
  - Database: 'seed'

## Setup

To start develop server:
````
$ npm install
$ npm start
````

`.env` sample file content:
````dotenv
NODE_ENV=development
````

`config/local.js` sample file content:
````javascript
module.exports = {
  database: {
    debug: false,
  },
};
````

## Documents

### REST APIs

**NOTE**: swagger document endpoint only exists in 'develop'environment

Swagger document endpoints:
- `http://localhost:3000/docs`

### Helper functions

#### `withCircuitBreaker(action, options)`

Helper function to create a function with circuit breaker pattern

##### Example

````javascript
// Define function
const createAction = () => {
  let time = 0;

  return async () => {
    time += 1;
    
    if ([1, 2, 3].includes(time)) {
      throw new Error()
    }
    
    return 'success'
  }
};

const action = createAction();

const actionWithCircuitBreaker = withCircuitBreaker(action);

// Trigger error
for (let i = 0; i < 4; i++) {
  try {
    await actionWithCircuitBreaker();
  } catch(err) {
    console.error(err);
  }
}

// After wait 10 seconds
const result = await actionWithCircuitBreaker();
console.log(result);


// The console logs:
// Error
// Error
// Error
// BreakError
// success
````

##### Parameters
- `action` (*function*) - **required**: the function that will be integrated with circuit breaker logic. **Must return a `Promise`**
- `options` (*object*):
  - `maxRetry` (*integer*): amount of maximum retry time before throwing error - **default is 3**
  - `timeout` (*integer*): **in millisecond**, amount of time to wait for action to complete - **default is 2000**
  - `breakTimeout` (*integer*): **in millisecond**, amount of cool-down time, after throwing error, to be able to trigger `action` agains - **default is 10000**

#### `withRetry(action, options)`

Helper function to create a function with retry logic

##### Example

````javascript
const createAction = () => {
  let time = 0;

  return async () => {
    time += 1;
    
    if ([1, 2].includes(time)) {
      throw new Error()
    }
    
    return 'success'
  }
};

const action = createAction();

const actionWithRetry = withRetry(action);

// Trigger action
try {
  const result = await actionWithRetry();
  console.log(result);
} catch(err) {
  console.error(err);
}

// Console wil log
// success
````
##### Parameters
- `action` (*function*) - **required**: the function that will be integrated with retry logic. **Must return a `Promise`**
- `options` (*object*):
  - `maxRetry` (*integer*): amount of maximum retry time before throwing error - **default is 3**
