#!/usr/bin/env node

import shell from "shelljs";
import * as fs from "fs";
import * as os from "os";
import { execSync } from "child_process";
import { input, select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";

import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const CURR_DIR = process.cwd();

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
        value: "js",
      },
      {
        name: "Typescript",
        value: "ts",
      },
    ],
    default: "js",
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
  return {
    folderName,
    typeOFScript,
    packageManger,
    addRouter,
    addAxios,
    addRedux,
    reduxMiddlewareType,
    cssFramework,
  };
};
const createProjectDirectory = async (
  projectName: string
) => {
  if (fs.existsSync(projectName)) {
    console.log(
      chalk.red(`Folder ${projectName} exists. Delete or use another name.`)
    );
    return false;
  }
  fs.mkdirSync(projectName);

  return true;
};
const createDirectoryContents = async (
  templatePath: string,
  newProjectPath: string
): Promise<boolean> => {
  try {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach((file) => {
      const origFilePath = `${templatePath}/${file}`;
      // get stats about the current file
      const stats = fs.statSync(origFilePath);
      if (stats.isFile()) {
        const contents = fs.readFileSync(origFilePath, "utf8");
        if (file === ".npmignore") file = ".gitignore";

        const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
        fs.writeFileSync(writePath, contents, "utf8");
      } else if (stats.isDirectory()) {
        fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

        // recursive call
        createDirectoryContents(
          `${templatePath}/${file}`,
          `${newProjectPath}/${file}`
        );
      }
    });
    return true;
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
};

/*const intializeGitAndPackage = async (packageManger: string) => {
  const installInitial = runCommand(
    packageManger === "npm" ? "npm install" : "yarn"
  );
  if (!installInitial) process.exit(-1);
  runCommand(`echo 'node_module' > .gitignore`);
  console.log(chalk.blueBright("Initializing git"));
  runCommand(`git init`);
  shell.echo("Configuring selected packages with project");
};*/
const installRouterPkg = async (typePackage: string) => {
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
      fs.writeFileSync("src/router/CustomRouter.jsx", "");
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      process.exit(-1);
    }
  } else {
    shell.mkdir("src/router");
    shell.touch("src/router/CustomRouter.jsx");
  }
};
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
  await init();
  try {
    let userresponse = await generateQuestionsForFolder();
    let {
      folderName,
      typeOFScript,
      packageManger,
      addRouter,
      addAxios,
      addRedux,
      reduxMiddlewareType,
      cssFramework,
    } = await userresponse;
    let typePackage = packageManger === "npm" ? "npm install" : "yarn add";
    let isFolderCreated = await createProjectDirectory(folderName);
    if (!isFolderCreated) {
      return;
    }
    let projectChoice =
      typeOFScript === "js" ? "sample-react" : "sample-react-typescript";
    const templatePath = `${__dirname}/templates/${projectChoice}`;
    const isDirectoryMade = createDirectoryContents(templatePath, folderName);
    if (isDirectoryMade) {
      shell.cd(`${folderName}`);
      console.log(
        "Creating & Installing base files in:",
        chalk.bgCyan(chalk.bold(folderName))
      );
      const installPackage = runCommand(
        `${packageManger === "npm" ? "npm install" : "yarn"}`
      );
      if (!installPackage) process.exit(-1);
      if (addRouter) await installRouterPkg(typePackage);
      if (addAxios) await installAxiosPkg(typePackage);
      if (addRedux) {
        await installReduxPkg(typePackage, typeOFScript);
        if (reduxMiddlewareType === "redux-thunk")
          await installReduxThunkPkg(typePackage, typeOFScript);
        else if (reduxMiddlewareType === "redux-saga")
          await installReduxSagaPkg(typePackage, typeOFScript);
        else return;
      }
      if (cssFramework !== "None")
        switch (cssFramework) {
          case "MUI":
            await installMuiCSSPkg(typePackage);
            break;
          case "Bootstrap":
            await installBootstrapCSSPkg(typePackage, typeOFScript);
            break;
          case "TailwindCSS":
            await installTailwindCSSPkg(typePackage, typeOFScript);
            break;
          default:
            break;
        }
      showMessage(folderName, packageManger);
    }
  } catch (error) {
    forceClosed();
    process.exit(0);
  }
};

export default generateFolder();
