// import {hc} from "hono/client"

// import type { AppType } from '~/app/api/hono/[[...route]]/route'

// const client = hc<AppType>("http://127.0.0.1:3000/api/hono/");

// const apiUsers = client.users.$get()
// console.log(apiUsers)
// // client.users[":id"].$get({id: 1}).then(console.log)
// client.users.name[":name"].$get({param: {name: "test1"}}).then(console.log)
// // client.users[":id"].$patch({id: 1, body: {name: "test1"}}).then(console.log)

// const users_url = client.users.$url()
// console.log(`users_url: ${users_url}`)
