#!/usr/bin/env node

const shell = require("shelljs");
const inquirer = require("inquirer");
const execSync = require("child_process").execSync;
const chalk = import("chalk").then((m) => m.default);
const figlet = require("figlet");
const os = require("os");
const { sign } = require("crypto");
const fs = require("fs");
const path = require('path');

const init = async () => {
  const _chalk = await chalk;
  console.log(
    _chalk.blueBright(
      figlet.textSync("Super React App", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
};

if (!shell.which("git")) {
  shell.echo("Sorry, this script requires git");
  shell.exit(1);
}

const questions = [
  {
    type: "input",
    name: "projectName",
    message: "Please enter your new project's name.",
    default: "super-react-project",
  },
  {
    type: "list",
    name: "packageManger",
    message: "Please choose the package manager:",
    choices: ["npm", "yarn"],
    default: "npm",
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
    when: (answers) => answers.addRedux === true,
  },
  {
    type: "list",
    name: "cssFramework",
    message: "Please choose the css framwork you want to use for the project:",
    choices: ["TailwindCSS", "MUI", "Bootstrap", "None of the above"],
    default: "TailwindCSS",
  },
];

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
}

const createProjectDirectory = async (projectName) => {
  const _chalk = await chalk;
  const rootPath = path.join(__dirname, '/packages/sample-react');
  console.log(rootPath)
  console.log(_chalk.green("Preparing files......"));
  shell.exec(`mkdir ${projectName}`);
  console.log(
    "Creating & Installing base files in:",
    _chalk.bgCyan(_chalk.bold(projectName))
  );
  shell.cd(`${projectName}`);
  if (os.type() === "Windows_NT") {
    shell.exec(`xcopy /s /e ..\\packages\\sample-react\\* .`);
  } else shell.exec(`cp -r ${rootPath}/* ./`);
}

const intializeGitAndPackage = async (packageManger) => {
  const _chalk = await chalk;

  const installInitial = runCommand(packageManger === "npm" ? "npm install" : "yarn");
  if (!installInitial) process.exit(-1);
  console.log(_chalk.blueBright("Initializing git"))
  shell.exec(`git init`)
  shell.echo("Configuring selected packages with project");
}

const installRouterPkg = async (typePackage) => {
  const _chalk = await chalk;
  shell.echo(
    `Installing ${_chalk.blue(
      "react-router"
    )} and creating router files inside src/ folder`
  );
  const installRouter = runCommand(`${typePackage} react-router-dom`);
  if (!installRouter) process.exit(-1);
  if (os.type() === "Windows_NT") {
    try {
      fs.mkdirSync("src/router", { recursive: true });
      fs.writeFileSync("src/router/CustomRouter.jsx", "");
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(-1);
    }
  }
  else {
    shell.mkdir("src/router");
    shell.touch("src/router/CustomRouter.jsx");
  }
}
const installAxiosPkg = async (typePackage) => {
  const _chalk = await chalk;
  shell.echo(`Installing ${_chalk.blue("axios")}`);
  const installAxios = runCommand(`${typePackage} axios`);
  if (!installAxios) process.exit(-1);
}
const installReduxPkg = async (typePackage) => {
  const _chalk = await chalk;
  shell.echo(`Installing ${_chalk.blue("redux")}`);
  const installRedux = runCommand(
    `${typePackage} redux @reduxjs/toolkit && ${typePackage} -D react-redux`
  );
  if (!installRedux) process.exit(-1);
  if (os.type() === "Windows_NT") {
    fs.mkdirSync("src/redux/", { recursive: true });
    fs.mkdirSync("src/redux/action", { recursive: true });
    fs.mkdirSync("src/redux/action/config", { recursive: true });
    fs.writeFileSync("src/redux/action/config/store.jsx", "");
  }
  else {
    shell.echo("Setting redux folders and files");
    shell.mkdir("src/redux/");
    shell.mkdir("src/redux/action");
    shell.mkdir("src/redux/action/config");
    shell.touch("src/redux/action/config/store.jsx");
  }
}

const installReduxThunkPkg = async (typePackage) => {
  const _chalk = await chalk;

  shell.echo(`Installing and Setting ${_chalk.blue("redux-thunk")}`);
  const installReduxThunk = runCommand(`${typePackage} redux-thunk`);
  if (!installReduxThunk) process.exit(-1);
  const thunkStoreCode = `
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

const store = configureStore({
    reducer: {},
    middleware: [thunk]
})
export default store`;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync("src/redux/action/config/store.jsx", thunkStoreCode);
  }
  else {
    let writeStoreFile =
      runCommand(`cat > src/redux/action/config/store.jsx << "EOF"
      ${thunkStoreCode}`);
    if (!writeStoreFile) process.exit(-1);
  }
}

const installReduxSagaPkg = async (typePackage) => {
  const _chalk = await chalk;

  shell.echo(`Installing and Setting ${_chalk.blue("redux-saga")}`);
  const installReduxSaga = runCommand(`${typePackage} redux-saga`);
  if (!installReduxSaga) process.exit(-1);
  const sagaStoreCode = `
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()
const saga = [sagaMiddleware]

const store = configureStore({
    reducer: {},
    middleware: [saga]
})
export default store`;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync("src/redux/action/config/store.jsx", thunkStoreCode);
  }
  else {
    let writeStoreFile =
      runCommand(`cat > src/redux/action/config/store.jsx << "EOF"
    ${sagaStoreCode}`);
    if (!writeStoreFile) process.exit(-1);
  }
}

const installMuiCSSPkg = async (typePackage) => {
  const _chalk = await chalk;

  shell.echo(`Installing ${_chalk.blue("MUI")}`);
  const installMui = runCommand(
    `${typePackage} @mui/material @emotion/react @emotion/styled && ${typePackage} postcss-loader`
  );
  if (!installMui) process.exit(-1);
}

const installBootstrapCSSPkg = async (typePackage) => {
  const _chalk = await chalk;

  shell.echo(`Installing ${_chalk.blue("Bootstrap")}`);
  const installBootstrap = runCommand(
    `${typePackage} react-bootstrap bootstrap postcss-loader precss autoprefixer sass-loader --save`
  );
  if (!installBootstrap) process.exit(-1);
  const bootstrapIndexCode = `
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
);`
  if (os.type() === "Windows_NT") {
    fs.writeFileSync("src/index.jsx", bootstrapIndexCode);
  } else {
    let writeBootstrapConfig = runCommand(`cat > src/index.jsx << "EOF"
${bootstrapIndexCode}`);
    if (!writeBootstrapConfig) process.exit(-1);
  }
}

const installTailwindCSSPkg = async (typePackage) => {
  const _chalk = await chalk;

  shell.echo(
    `Installing and Configuring ${_chalk.blue("TailwindCSS")}`
  );
  const installTailwind = runCommand(
    `${typePackage} -D postcss-preset-env tailwindcss autoprefixer && ${typePackage} postcss-loader`
  );
  if (!installTailwind) process.exit(-1);
  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
"./src/**/*.{js,jsx,ts,tsx}",
],
theme: {
extend: {},
},
plugins: [],
}
`
  const postCssConfig = `
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
        
module.exports = {
plugins: [tailwindcss('./tailwind.config.cjs'), autoprefixer],
};
`
  const indexCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`
  const indexJSXContent = `
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
);
`
  if (os.type() === "Windows_NT") {
    fs.writeFileSync('tailwind.config.cjs', tailwindConfig)
    fs.writeFileSync('postcss.config.cjs', tailwindConfig)
    fs.writeFileSync('src/index.jsx', indexJSXContent)
    fs.writeFileSync('src/index.css', indexCSS)
  }
  else {
    shell.touch("tailwind.config.cjs");
    let writeTailwindConfig =
      runCommand(`cat > tailwind.config.cjs << "EOF"
${tailwindConfig}`);
    if (!writeTailwindConfig) process.exit(-1);
    shell.touch("postcss.config.cjs");
    let writePostCSSConfig =
      runCommand(`cat > postcss.config.cjs << "EOF"
${postCssConfig}`);
    if (!writePostCSSConfig) process.exit(-1);
    shell.touch("src/index.css");
    let writeglobalTailwindCss =
      runCommand(`cat > src/index.css << "EOF"
${indexCSS}`);
    if (!writeglobalTailwindCss) process.exit(-1);
    let changedIndexjs = runCommand(`cat > src/index.jsx << "EOF"
${indexJSXContent}`);
    if (!changedIndexjs) process.exit(-1);
  }
}

const generateFolder = async () => {
  const _chalk = await chalk;
  await init();
  inquirer
    .prompt(questions)
    .then(async (answers) => {
      const {
        projectName,
        packageManger,
        addRouter,
        addAxios,
        addRedux,
        middlewareType,
        cssFramework,
      } = answers;
      let typePackage = packageManger === "npm" ? "npm install" : "yarn add"
      await createProjectDirectory(projectName);
      await intializeGitAndPackage(packageManger)
      if (addRouter) {
        await installRouterPkg(typePackage)
      }
      if (addAxios) {
        await installAxiosPkg(typePackage)
      }
      if (addRedux) {
        await installReduxPkg(typePackage)

        if (middlewareType === "redux-thunk") {
          await installReduxThunkPkg(typePackage)
        }
        if (middlewareType === "redux-saga") {
          await installReduxSagaPkg(typePackage)
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
          case "MUI":
            await installMuiCSSPkg(typePackage)
            break;
          case "Bootstrap":
            await installBootstrapCSSPkg(typePackage)
            break;
          case "TailwindCSS":
            await installTailwindCSSPkg(typePackage)
            break;

          default:
            break;
        }
      }
      shell.echo(
        `${_chalk.greenBright(projectName + " successfully created")}`
      );
      shell.echo(`To run the project:`);
      shell.echo(`    ${_chalk.blue("cd " + projectName)}`);
      shell.echo(`    ${_chalk.blue(`${packageManger} run dev`)}`);
      shell.echo(`${_chalk.red(_chalk.bold("Happy Coding!!!"))}`);
    }).catch((error) => {
      shell.echo("Process being interrpeted");
      shell.echo(error);
    });
};

generateFolder()