![Token Price Oracle - SC - banner](./github/assets/webcave.png)
Light & Pluggable clone of the Cave Game written in TypeScript

## Structure ◕_◕
This repository is a monorepo containing packages needed to run
WebCave in your project or simply spinning up your own client
and server

### Projects
**webcave-core**  
Contains all the core game business logic
---
**webcave-client**  
Client implementation for any JS/TS frontend
---
**webcave-react**  
React wrapper for **webcave-client** package
---
**webcave-example-frontend**  
Example React/Vite/Typescript project showcasing how to run the
game
---

## Running the project ⊂(◉‿◉)つ
### Requirements (︶︹︶)
To run the project, you'll need:
- [Node.js](https://nodejs.org/en/) (Version 18)
- [Yarn](https://yarnpkg.com/)

### Installation ███▒▒▒▒▒▒▒
#### Git
1. Clone the repo: ```git clone https://github.com/acid-info/WebCave.git```
2. Navigate to the folder: ```cd WebCave```

#### Installing the dependencies
3. Run ```yarn``` to install the dependencies

### Commands ¯\(°_o)/¯
| Name    | Command                               | Description                                |
|---------|---------------------------------------|--------------------------------------------|
| Build   | ```yarn build```                      | Builds all the packages inside the project |
| Linting | ```yarn lint```                       | Lints the project using `pretty-quick`     |
| Running | ```yarn dev```              | Runs the project in development mode       |
