#!/usr/bin/env node

const shell = require("shelljs");
const inquirer = require("inquirer");
const execSync = require('child_process').execSync;
const chalk = import("chalk").then(m => m.default);
const figlet = require("figlet");



const init = async () => {
    const _chalk = await chalk;
    console.log(_chalk.blueBright(figlet.textSync("Super React App", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default"
    }))
    )
}

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

const questions = [

    {
        type: "input",
        name: "projectName",
        message: "Please enter your new project's name.",
        default: "super-react-project"
    },
    {
        type: "confirm",
        name: "addRouter",
        message: "Do you want to add router to the project(react-router)?:",
        default: true,
    },
    {
        type: "confirm",
        name: "addAxios",
        message: `Do you want to add axios for API calls?:`,
        default: true,
    },
    {
        type: "confirm",
        name: "addRedux",
        message: "Do you want to add redux?:",
        default: true,
    },
    {
        type: "list",
        name: "middlewareType",
        message: "Please choose the Redux's middleware the project:",
        // choices: ["redux-thunk", "redux-saga", "redux-promise-middleware"],
        choices: ["redux-thunk", "redux-saga"],
        default: "redux-thunk",
        when: (answers) => answers.addRedux === true
    },
    {
        type: "list",
        name: "cssFramework",
        message: "Please choose the css framwork you want to use for the project:",
        choices: ["TailwindCSS", "MUI", "Bootstrap", "None of the above"],
        default: "TailwindCSS"
    },
];

const runCommand = command => {
    try {
        execSync(`${command}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute ${command}`, e);
        return false;
    }
    return true;
}
const generateFolder = async () => {
    const _chalk = await chalk;
    await init()
    inquirer.prompt(questions).then(answers => {
        const { projectName, addRouter, addAxios, addRedux, middlewareType, cssFramework } = answers
        console.log(_chalk.green("Preparing files......"))
        shell.exec(`mkdir ${projectName}`);
        shell.cd(`${projectName}`);

        console.log("Creating & Installing base files in:",_chalk.bgCyan(_chalk.bold(projectName)))
        shell.exec(`cp -r ../packages/sample-react/* ./`)

        const installInitial = runCommand('npm install')
        if (!installInitial) process.exit(-1)

        shell.echo("Configuring selected packages with project")

        if (addRouter) {
            shell.echo(`Installing ${_chalk.blue("react-router")} and creating router files inside src/ folder`)
            const installRouter = runCommand(`npm i react-router-dom`)
            if (!installRouter) process.exit(-1)
            shell.mkdir('src/router')
            shell.touch('src/router/CustomRouter.jsx')
        }
        if (addAxios) {
            shell.echo(`Installing ${_chalk.blue("axios")}`)
            const installAxios = runCommand(`npm i axios`)
            if (!installAxios) process.exit(-1)
        }
        if (addRedux) {
            shell.echo(`Installing ${_chalk.blue("redux")}`)
            const installRedux = runCommand('npm i redux @reduxjs/toolkit && npm i -D react-redux')
            if (!installRedux) process.exit(-1)
            shell.echo("Setting redux folders and files")
            shell.mkdir('src/redux/')
            shell.mkdir('src/redux/action')
            shell.mkdir('src/redux/action/config')
            shell.touch('src/redux/action/config/store.jsx')

            if (middlewareType === "redux-thunk") {
                shell.echo(`Installing and Setting ${_chalk.blue("redux-thunk")}`)
                const installReduxThunk = runCommand('npm i redux-thunk')
                if (!installReduxThunk) process.exit(-1)
                let writeStoreFile = runCommand(`cat > src/redux/action/config/store.jsx << "EOF"
    import { configureStore } from '@reduxjs/toolkit'
    import thunk from 'redux-thunk'
    const store = configureStore({
        reducer: {},
        middleware: [thunk]
    })
    export default store`)
                if (!writeStoreFile) process.exit(-1)
            }
            if (middlewareType === "redux-saga") {
                shell.echo(`Installing and Setting ${_chalk.blue("redux-saga")}`)
                const installReduxSaga = runCommand('npm i redux-saga')
                if (!installReduxSaga) process.exit(-1)
                let writeStoreFile = runCommand(`cat > src/redux/action/config/store.jsx << "EOF"
    import { configureStore } from '@reduxjs/toolkit'
    import createSagaMiddleware from 'redux-saga'
    
    const sagaMiddleware = createSagaMiddleware()
    const saga = [sagaMiddleware]
    
    const store = configureStore({
        reducer: {},
        middleware: [saga]
    })
    export default store`)
                if (!writeStoreFile) process.exit(-1)
            }
            /*if (middlewareType === "redux-promise-middleware") {
                shell.echo("Installing and Setting redux-promise-middleware")
                const installReduxPM = runCommand('npm i redux-promise-middleware -s')
                if (!installReduxPM) process.exit(-1)
                let writeStoreFile = runCommand(`cat > src/redux/action/config/store.jsx << "EOF"
    import { configureStore } from '@reduxjs/toolkit'
    import promise from 'redux-promise-middleware'
    
    const store = configureStore({
        reducer: {},
        middleware: [promise]
    })
    export default store`)
                if (!writeStoreFile) process.exit(0)
            }*/
        }
        if (cssFramework !== "None of the above") {
            switch (cssFramework) {
                case 'MUI':
                    shell.echo(`Installing ${_chalk.blue("MUI")}`)
                    const installMui = runCommand('npm install @mui/material @emotion/react @emotion/styled && npm install postcss-loader')
                    if (!installMui) process.exit(-1)
                    break;
                case 'Bootstrap':
                    shell.echo(`Installing ${_chalk.blue("Bootstrap")}`)
                    const installBootstrap = runCommand('npm install react-bootstrap bootstrap postcss-loader precss autoprefixer sass-loader --save')
                    if (!installBootstrap) process.exit(-1)
                    let writeBootstrapConfig = runCommand(`cat > src/index.js << "EOF"
    import React from "react";
    import { createRoot } from "react-dom/client";
    import App from "./App";
    import 'bootstrap/dist/css/bootstrap.min.css';
    
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );`)
                    if (!writeBootstrapConfig) process.exit(-1)
                    break;
                case 'TailwindCSS':
                    shell.echo(`Installing and Configuring ${_chalk.blue("TailwindCSS")}`)
                    const installTailwind = runCommand(`npm i -D postcss-preset-env tailwindcss autoprefixer && npm i postcss-loader`)
                    if (!installTailwind) process.exit(-1)
                    shell.touch('tailwind.config.cjs')
                    let writeTailwindConfig = runCommand(`cat > tailwind.config.cjs << "EOF"
    /** @type {import('tailwindcss').Config} */
    module.exports = {
        content: [
            "./src/**/*.{js,jsx,ts,tsx}",
        ],
        theme: {
            extend: {},
        },
        plugins: [],
    }`)
                    if (!writeTailwindConfig) process.exit(-1)
                    shell.touch('postcss.config.cjs')
                    let writePostCSSConfig = runCommand(`cat > postcss.config.cjs << "EOF"
    const tailwindcss = require('tailwindcss');
    const autoprefixer = require('autoprefixer');
                    
    module.exports = {
        plugins: [tailwindcss('./tailwind.config.cjs'), autoprefixer],
    };`)
                    if (!writePostCSSConfig) process.exit(-1)
                    shell.touch('src/index.css')
                    let writeglobalTailwindCss = runCommand(`cat > src/index.css << "EOF"
    @tailwind base;
    @tailwind components;
    @tailwind utilities;`)
                    if (!writeglobalTailwindCss) process.exit(-1)
                    let changedIndexCSS = runCommand(`cat > src/index.css << "EOF"
    @tailwind base;
    @tailwind components;
    @tailwind utilities;`)
                    if (!changedIndexCSS) process.exit(-1)
                    let changedIndexjs = runCommand(`cat > src/index.js << "EOF"
    import React from "react";
    import { createRoot } from "react-dom/client";
    import App from "./App";
    import "./index.css";
    
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );`)
                    if (!changedIndexjs) process.exit(-1)
                    break;

                default:
                    break;
            }
        }
        shell.echo(`${_chalk.greenBright(projectName+" successfully created")}`)
        shell.echo(`To run the project:`)
        shell.echo(`    ${_chalk.blue("cd "+projectName)}`)
        shell.echo(`    ${_chalk.blue("npm run dev")}`)
        shell.echo(`${_chalk.red(_chalk.bold("Happy Coding!!!"))}`)
    }).catch((error) => {
        shell.echo("Process being interrpeted")
        shell.echo(error)
    });
}
generateFolder()