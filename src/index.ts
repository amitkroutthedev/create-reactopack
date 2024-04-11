#!/usr/bin/env node
import * as fs from 'fs';
import * as os from "os";
import * as path from 'path';
import { input, select, confirm } from "@inquirer/prompts";
import chalk from 'chalk';
import * as shell from 'shelljs';
import { execSync } from 'child_process';
import gradient from "gradient-string";
import figlet from "figlet";

const CHOICES = fs.readdirSync(path.join(__dirname, 'templates'));

const init = async () => {
  console.log(
    gradient(["#f72585", "#f4f1de", "#f4a261"])(
      figlet.textSync("CREATE RP APP", {
        font: "Ogre",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(chalk.bold(chalk.magenta(">>>>>>  Welcome to REACTOPACK")));
};

interface UserRequest {
  addRouter: boolean
  addAxios: boolean
  addRedux: boolean
  reduxMiddlewareType: boolean | string
  CSSFramework: string
}
interface CliOptions {
  projectName: string
  templateName: string
  templatePath: string
  tartgetPath: string
}
const CURR_DIR = process.cwd();


const runCommand = (command: string) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
};

const forceClosed = () => {
  shell.echo(chalk.bold(chalk.redBright("Forced Closed")));
};

const generateQuestionsForFolder = async () => {
  const folderName = await input({
    message: "Enter your folder name: ",
    validate: async (input: string) => {
      if (input === "") return "Folder name cannot be empty";
      return true;
    },
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const typeOFScript = await select({
    message: "Will you be using TypeScript or JavaScript?",
    choices: [
      {
        name: "Javascript",
        value: CHOICES[0],
      },
      {
        name: "Typescript",
        value: CHOICES[1],
      },
    ]
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const packageManger = await select({
    message: "Select a package manager:",
    choices: [
      {
        name: "npm",
        value: "npm",
        description: "npm is the most popular package manager",
      },
      {
        name: "yarn",
        value: "yarn",
        description: "yarn is an awesome package manager",
      },
    ],
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const addRouter = await confirm({
    message: "Do you want to add router to the project(react-router)?",
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const addAxios = await confirm({
    message: "Do you want to add axios for API calls?",
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const addRedux = await confirm({
    message: "Do you want to add redux?",
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  const reduxMiddlewareType =
    addRedux === true &&
    (await select({
      message: `Please choose the Redux's middleware the project:`,
      choices: [
        {
          name: "redux-thunk",
          value: "redux-thunk",
        },
        {
          name: "redux-saga",
          value: "redux-saga",
        },
      ],
      default: "redux-thunk",
    }).catch((e) => {
      forceClosed();
      process.exit(0);
    }));
  const cssFramework = await select({
    message: "Please choose the css framework",
    choices: [
      {
        name: "TailwindCSS",
        value: "TailwindCSS",
        description:
          "Utility-first CSS framework for responsive web development.",
      },
      {
        name: "MUI",
        value: "MUI",
        description:
          "React framework with customizable Material Design components.",
      },
      {
        name: "Bootstrap",
        value: "Bootstrap",
        description: "Front-end framework for easy, responsive website design",
      },
      { name: "None of the above", value: "None" },
    ],
  }).catch((e) => {
    forceClosed();
    process.exit(0);
  });
  return { typeOFScript, folderName, packageManger, addRouter, addAxios, addRedux, reduxMiddlewareType, cssFramework }
};

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Folder ${projectPath} exists. Delete or use another name.`));
    return false;
  }
  fs.mkdirSync(projectPath);

  return true;
}
// list of file/folder that should not be copied
const SKIP_FILES = ['node_modules', '.template.json'];
function createDirectoryContents(templatePath: string, projectName: string) {
  // read all files/folders (1 level) from template folder
  const filesToCreate = fs.readdirSync(templatePath);
  // loop each file/folder
  filesToCreate.forEach(file => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    // skip files that should not be copied
    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      // read file content and transform it using template engine
      let contents = fs.readFileSync(origFilePath, 'utf8');
      // write file to destination folder
      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));
      // copy files/folder inside current folder recursively
      createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
    }
  });
}

const installAxiosPkg = async (typePackage: string) => {
  shell.echo(`Installing ${chalk.blue("axios")}`);
  const installAxios = runCommand(`${typePackage} axios`);
  if (!installAxios) process.exit(-1);
};
const installReduxPkg = async (typePackage: string, typeOFScript: string) => {
  shell.echo(`Installing ${chalk.blue("redux")}`);
  const installRedux = runCommand(
    `${typePackage} redux @reduxjs/toolkit && ${typePackage} -D react-redux`
  );
  if (!installRedux) process.exit(-1);
  if (os.type() === "Windows_NT") {
    fs.mkdirSync("src/redux/", { recursive: true });
    fs.mkdirSync("src/redux/action", { recursive: true });
    fs.mkdirSync("src/redux/action/config", { recursive: true });
    fs.writeFileSync(`src/redux/action/config/store.${typeOFScript}x`, "");
  } else {
    shell.echo("Setting redux folders and files");
    shell.mkdir("src/redux/");
    shell.mkdir("src/redux/action");
    shell.mkdir("src/redux/action/config");
    shell.touch(`src/redux/action/config/store.${typeOFScript}x`);
  }
};
const installReduxThunkPkg = async (
  typePackage: string,
  typeOFScript: string
) => {
  shell.echo(`Installing and Setting ${chalk.blue("redux-thunk")}`);
  const installReduxThunk = runCommand(`${typePackage} redux-thunk`);
  if (!installReduxThunk) process.exit(-1);
  const thunkStoreJSXCode = `
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
  
const store = configureStore({
    reducer: {},
    middleware: [thunk]
})
  
export default store`;
  const thunkStoreTSXCode = `
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
  
const store = configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({thunk:true})
})
  
export default store`;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync(
      `src/redux/action/config/store.${typeOFScript}x`,
      typeOFScript === "js" ? thunkStoreJSXCode : thunkStoreTSXCode
    );
  } else {
    let writeStoreFile =
      runCommand(`cat > src/redux/action/config/store.${typeOFScript}x << "EOF"
      ${typeOFScript === "js" ? thunkStoreJSXCode : thunkStoreTSXCode}`);
    if (!writeStoreFile) process.exit(-1);
  }
};
const installReduxSagaPkg = async (
  typePackage: string,
  typeOFScript: string
) => {
  shell.echo(`Installing and Setting ${chalk.blue("redux-saga")}`);
  const installReduxSaga = runCommand(`${typePackage} redux-saga`);
  if (!installReduxSaga) process.exit(-1);
  const sagaStoreJSXCode = `
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
  
const sagaMiddleware = createSagaMiddleware()
const saga = [sagaMiddleware]
  
const store = configureStore({
      reducer: {},
      middleware: [saga]
})
export default store`;
  const sagaStoreTSXCode = `
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
  
const sagaMiddleware = createSagaMiddleware()
  
const store = configureStore({
      reducer: {},
      middleware: (gDM) => gDM().concat(sagaMiddleware)
})
export default store;`;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync(
      `src/redux/action/config/store.${typeOFScript}x`,
      typeOFScript === "js" ? sagaStoreJSXCode : sagaStoreTSXCode
    );
  } else {
    let writeStoreFile =
      runCommand(`cat > src/redux/action/config/store.${typeOFScript}x << "EOF"
      ${typeOFScript === "js" ? sagaStoreJSXCode : sagaStoreTSXCode}`);
    if (!writeStoreFile) process.exit(-1);
  }
};
const installRouterPkg = async (typePackage: string, typeOFScript: string) => {
  shell.echo(
    `Installing ${chalk.blue(
      "react-router"
    )} and creating router files inside src/ folder`
  );
  const installRouter = runCommand(`${typePackage} react-router-dom`);
  if (!installRouter) process.exit(-1);
  if (os.type() === "Windows_NT") {
    try {
      fs.mkdirSync("src/router", { recursive: true });
      fs.writeFileSync(`src/router/CustomRouter.${typeOFScript}`, "");
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(-1);
    }
  } else {
    shell.mkdir("src/router");
    shell.touch(`src/router/CustomRouter.${typeOFScript}`);
  }
};
const installMuiCSSPkg = async (typePackage: string) => {
  shell.echo(`Installing ${chalk.blue("MUI")}`);
  const installMui = runCommand(
    `${typePackage} @mui/material @emotion/react @emotion/styled && ${typePackage} postcss-loader`
  );
  if (!installMui) process.exit(-1);
};
const installBootstrapCSSPkg = async (
  typePackage: string,
  typeOFScript: string
) => {
  shell.echo(`Installing ${chalk.blue("Bootstrap")}`);
  const installBootstrap = runCommand(
    `${typePackage} react-bootstrap bootstrap postcss-loader precss autoprefixer sass-loader --save`
  );
  if (!installBootstrap) process.exit(-1);
  const bootstrapIndexCodejsx = `import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import 'bootstrap/dist/css/bootstrap.min.css';
  
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement);
  root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
  );`;
  const bootstrapIndexCodetsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';

const rootElement = document.getElementById("root");

const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
  `;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync(
      `src/index.${typeOFScript}x`,
      typeOFScript === "js" ? bootstrapIndexCodejsx : bootstrapIndexCodetsx
    );
  } else {
    let writeBootstrapConfig =
      runCommand(`cat > src/index.${typeOFScript}x << "EOF"
  ${typeOFScript === "js" ? bootstrapIndexCodejsx : bootstrapIndexCodetsx}`);
    if (!writeBootstrapConfig) process.exit(-1);
  }
};
const installTailwindCSSPkg = async (
  typePackage: string,
  typeOFScript: string
) => {
  shell.echo(`Installing and Configuring ${chalk.blue("TailwindCSS")}`);
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
  `;
  const postCssConfig = `
  const tailwindcss = require('tailwindcss');
  const autoprefixer = require('autoprefixer');
          
  module.exports = {
  plugins: [tailwindcss('./tailwind.config.cjs'), autoprefixer],
  };
  `;
  const indexCSS = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  `;
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
  `;
  const indexTSXContent = `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

  `;
  if (os.type() === "Windows_NT") {
    fs.writeFileSync("tailwind.config.cjs", tailwindConfig);
    fs.writeFileSync("postcss.config.cjs", tailwindConfig);
    fs.writeFileSync(
      `src/index.${typeOFScript}x`,
      typeOFScript === "js" ? indexJSXContent : indexTSXContent
    );
    fs.writeFileSync("src/index.css", indexCSS);
  } else {
    shell.touch("tailwind.config.cjs");
    let writeTailwindConfig = runCommand(`cat > tailwind.config.cjs << "EOF"
  ${tailwindConfig}`);
    if (!writeTailwindConfig) process.exit(-1);
    shell.touch("postcss.config.cjs");
    let writePostCSSConfig = runCommand(`cat > postcss.config.cjs << "EOF"
  ${postCssConfig}`);
    if (!writePostCSSConfig) process.exit(-1);
    shell.touch("src/index.css");
    let writeglobalTailwindCss = runCommand(`cat > src/index.css << "EOF"
  ${indexCSS}`);
    if (!writeglobalTailwindCss) process.exit(-1);
    let changedIndexjs = runCommand(`cat > src/index.${typeOFScript}x << "EOF"
    ${typeOFScript === "js" ? indexJSXContent : indexTSXContent}`);
    if (!changedIndexjs) process.exit(-1);
  }
};

async function postProcess(options: CliOptions, packageManager: string, userRequestPackage: UserRequest, fileType: string) {
  const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'));
  if (isNode) {
    shell.cd(options.tartgetPath);
    try {
      chalk.magenta("Installing node_modules....")
      runCommand(`${packageManager} install`);
      let installCommand = packageManager === "npm" ? "npm install" : "yarn add"
      if (userRequestPackage.addRouter) await installRouterPkg(installCommand, fileType);
      if (userRequestPackage.addAxios) await installAxiosPkg(installCommand)
      if (userRequestPackage.addRedux) {
        await installReduxPkg(installCommand, fileType);
        if (userRequestPackage.reduxMiddlewareType === "redux-thunk") await installReduxThunkPkg(installCommand, fileType);
        else if (userRequestPackage.reduxMiddlewareType === "redux-saga") await installReduxSagaPkg(installCommand, fileType);
        else return;
      }
      if (userRequestPackage.CSSFramework !== "None") {
        switch (userRequestPackage.CSSFramework) {
          case "MUI":
            await installMuiCSSPkg(installCommand);
            break;
          case "Bootstrap":
            await installBootstrapCSSPkg(installCommand, fileType);
            break;
          case "TailwindCSS":
            await installTailwindCSSPkg(installCommand, fileType);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      forceClosed()
    }
  }
  return true;
}

const showMessage = async (folderName: string, packageManger: string) => {
  shell.echo(``);
  shell.echo(
    `${chalk.greenBright(chalk.bold(folderName) + " successfully created")}`
  );
  shell.echo(`To run the project:`);
  shell.echo(`    ${chalk.blue("cd " + chalk.bold(folderName))}`);
  shell.echo(`    ${chalk.blue(`${packageManger} run dev`)}`);
  shell.echo(`${chalk.red(chalk.bold("Happy Coding!!!"))}`);
};

const generateFolder = async () => {
  await init()
  let userresponse = await generateQuestionsForFolder();
  const projectChoice = userresponse.typeOFScript
  const projectName = userresponse.folderName
  const packageManager = userresponse.packageManger
  const fileType = projectChoice === "sample-react" ? "js" : "ts";
  //let typePackage = packageManager === "npm" ? "npm install" : "yarn add";
  const templatePath = path.join(__dirname, 'templates', projectChoice);
  const tartgetPath = path.join(CURR_DIR, projectName);
  const options: CliOptions = {
    projectName,
    templateName: projectChoice,
    templatePath,
    tartgetPath
  }
  if (!createProject(tartgetPath)) {
    return;
  }
  const userRequestPackage = {
    addRouter: userresponse.addRouter,
    addAxios: userresponse.addAxios,
    addRedux: userresponse.addRedux,
    reduxMiddlewareType: userresponse.reduxMiddlewareType,
    CSSFramework: userresponse.cssFramework
  }
  createDirectoryContents(templatePath, projectName);
  await postProcess(options, packageManager, userRequestPackage, fileType);
  showMessage(projectName, packageManager);

}

generateFolder()