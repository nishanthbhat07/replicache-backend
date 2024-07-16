# Todos with Replicache Integration (Backend)



## Setup
1. The project is built using npm package manager
2. Node js Version - 18 and above
3. Clone the repo `https://github.com/nishanthbhat07/replicache-backend`
4. After cloning, `cd replicache-backend` and install node_modules by doing `npm i`
5. After that, add all the below keys in .env file
	- POSTGRES_URL
	- POSTGRES_PRISMA_URL
	- POSTGRES_URL_NO_SSL
	- POSTGRES_URL_NON_POOLING
	- POSTGRES_USER
	- POSTGRES_HOST
	- POSTGRES_PASSWORD
	- POSTGRES_DATABASE
	- GITHUB_PAT
	- GITHUB_API_BASEURL
	- GITHUB_API_GRAPHQL (https://api.github.com/graphql)
6. Once env is setup, then run `prisma generate` to generate the ORM from prisma schema
7. For pushing the DB, run `prisma db push`.


###  Tech Stack
1. Express
2. Prisma Client - For ORM
3. Postgres DB - Using Vercel Postgres DB
4. Replicache and Replicache Transaction
5. Morgran - For logging in debug



### Features
1. This backend is integrated via vercel postgres DB via Prisma client
2. It can create space dynamically and user can select spaces which are created.
3. When an user creates an TODO, an issue is created in the github in the [App repo](https://github.com/nishanthbhat07/todosapp/issues)
4. The user can:
	- Create a Todo (Create a github issue)
	- Update a Todo (Update title of a  github issue)
	- Delete a todo (Delete a github issue)
	- Completed todo/github issues
5. For now, the sync happens only one way; i.e. when an user creates an issue from the app, it reflects in the issues section of the repo but vice versa capability is not there for now


Prisma Schema
```schema
generator  client {
	provider =  "prisma-client-js"
}

  

datasource  db {
	provider =  "postgresql"
	url =  env("POSTGRES_PRISMA_URL")
	directUrl =  env("POSTGRES_URL_NON_POOLING")
}

  

model  Todo {
	id Int  @id  @default(autoincrement())
	title String
	completed Boolean  @default(false)
	deleted Boolean  @default(false)
	githubIssueNumber Int?
	githubNodeId String?
}

  

model  ReplicacheClient {
	id String  @id
	lastMutationID Int
	lastPulled DateTime?
	mutations ReplicacheClientMutation[]
	version Int
	lastModified DateTime
	clientGroupID String

	@@index([clientGroupID, version])
}

  

model  ReplicacheClientMutation {
	id Int
	clientID String
	version Int
	mutation String
	createdAt DateTime  @default(now())
	client ReplicacheClient  @relation(fields: [clientID], references: [id])

	@@id([clientID, id])
}

  

model  ReplicacheSpace {
	id String  @id
	version Int
	lastModified DateTime
	entries ReplicacheEntry[]
}

model  ReplicacheEntry {
	spaceID String
	key String
	value String
	deleted Boolean
	version Int
	lastModified DateTime
	space ReplicacheSpace  @relation(fields: [spaceID], references: [id])

	@@unique([spaceID, key])
	@@index([spaceID])
	@@index([deleted])
	@@index([version])
}

model  ReplicacheMeta {
	key String  @id
	value Json
}
```



