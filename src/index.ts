#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
// import gradient from "gradient-string";
// import figlet from "figlet";
import axios from 'axios';
import pc from "picocolors"
import * as p from '@clack/prompts';
import { spinner } from '@clack/prompts';

import {UserRequest,CliOptions,QuestionResponse} from "./interface/interface"

const CHOICES = fs.readdirSync(path.join(__dirname, "protemplates", 'templates'));

const init = async () => {
  // console.log(
  //   gradient(["#f72585", "#f4f1de", "#f4a261"])(
  //     figlet.textSync("CREATE RP APP", {
  //       font: "Ogre",
  //       horizontalLayout: "default",
  //       verticalLayout: "default",
  //     })
  //   )
  // );
  console.log(pc.bold(pc.magenta(">>>>>>  Welcome to REACTOPACK")));
};


const CURR_DIR = process.cwd();


const forceClosed = () => {
  shell.echo(pc.bold(pc.red("Forced Closed")));
};



const generateQuestionsForFolder = async (): Promise<QuestionResponse> => {
  const group = await p.group({
    folderName:()=>p.text({
      message: "Enter your folder name: ", 
      validate(value) {
        if (value==="") return `Value is required!`;
        return undefined;
      },
      placeholder:"my-folder"
    }),
    typeOFScript:()=>p.select({
      message: "Will you be using TypeScript or JavaScript?",
      options: [
        {
          label: "Javascript",
          value: CHOICES[0],
        },
        {
          label: "Typescript",
          value: CHOICES[1],
        }]
    }),
    packageManger:()=>p.select({
      message: "Select a package manager:",
      options: [
        {
          label: "npm",
          value:"npm",
          hint: 'npm is the most popular package manager'
        },
        {
          label: "yarn",
          value: "yarn",
          hint: 'yarn is an awesome package manager'
        }]
    }),
   packages: ({ results }) =>
      p.multiselect({
        message: `What are packages to be there?`,
        options: [
          { value: 'react-router', label: 'React Router' },
          { value: 'axios', label: 'Axios' },
          { value: 'redux', label: 'Redux' },
        ],
      }),
      reduxMiddlewareType:({results}: {results: {packages: string[]}})=>results.packages.includes("redux")?p.select({
        message: "Please choose the Redux's middleware the project:",
        options: [
          {
            label: "redux-thunk",
            value:"redux-thunk",
          },
          {
            label: "redux-saga",
            value: "redux-saga",
          }]
      }):undefined,
      cssFramework:()=>p.select({
        message: "Please choose the css framework",
        options: [
          {
            label: "TailwindCSS",
            value: "TailwindCSS",
            hint:"Utility-first CSS framework for responsive web development."
          },
          {
            label: "MUI",
            value: "MUI",
            hint:"Utility-first CSS framework for responsive web development."
          },{
            label: "Bootstrap",
            value: "Bootstrap",
            hint:"Front-end framework for easy, responsive website design"
          },{
            label: "None of the above",
            value: "None",
          },
        ]
      }),
  }, {
    onCancel: () => {
      p.cancel('Operation cancelled.');
      process.exit(0);
    },
  }) as QuestionResponse;
  return group
}


function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(pc.red(`Folder ${projectPath} exists. Delete or use another name.`));
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

async function latestVersion(packageName: string | boolean) {
  return axios
    .get("https://registry.npmjs.org/" + packageName + "/latest")
    .then((res) => {
      return res.data.version;
    }).catch(e => {
      console.log(e)
      forceClosed()
    });
}

const createNewFolder = (targetPath: string, folderPath: string) => {
  const fullPath = path.join(targetPath, folderPath)
  fs.mkdirSync(fullPath, { recursive: true })
}
const createFileInFolder = (folderPath: string, fileName: string, content: string) => {
  const filePath = path.join(folderPath, fileName)
  fs.writeFileSync(filePath, content)
}

async function postProcess(options: CliOptions, packageManager: string, userRequestPackage: UserRequest, fileType: string) {
  const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'));
  const s = spinner()
  s.start("Getting packages.....")
  //spinner.spinner = cliSpinners.clock
  if (isNode) {
    const packageJsonPath = path.join(options.tartgetPath, 'package.json');
    shell.cd(options.tartgetPath);

    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);

      let currDependcies = { ...packageJson.dependencies }
      let currDevDependcies = { ...packageJson.devDependencies }

      const targetPath = options.tartgetPath

      const extratemplatePath = path.join(__dirname, "protemplates", 'file-template');
      if (userRequestPackage.addRouter) {
        s.message("Getting pakages...react-router-dom")
        let version = await latestVersion("react-router-dom")
        currDependcies["react-router-dom"] = version
      }
      if (userRequestPackage.addAxios) {
        s.message("Getting pakages...axios")
        let version = await latestVersion("axios")
        currDependcies['axios'] = version
      }
      if (userRequestPackage.addRedux) {
        s.message("Getting pakages...readux and react-redux")
        let reduxversion = await latestVersion("redux")
        let reactreduxversion = await latestVersion("react-redux")
        let reacttoolkitversion = await latestVersion("@reduxjs/toolkit")

        currDependcies["redux"] = reduxversion
        currDependcies["react-redux"] = reactreduxversion
        currDevDependcies["@reduxjs/toolkit"] = reacttoolkitversion

        createNewFolder(targetPath, 'src/redux/action/config')
        createFileInFolder(path.join(targetPath, 'src/redux/action/config'), `store.${fileType}x`, "")

        if (userRequestPackage.reduxMiddlewareType === "redux-thunk") {
          s.message("Getting pakages...redux-thunk")
          let reduxmiddlewareversion = await latestVersion("redux-thunk")
          currDependcies["redux-thunk"] = reduxmiddlewareversion

          let writereduxPath = path.join(extratemplatePath, "redux-thunk", `thunk.${fileType}`);
          let reduxContent = fs.readFileSync(writereduxPath, "utf-8");
          fs.writeFileSync(`src/redux/action/config/store.${fileType}x`, reduxContent, "utf-8");

        }
        if (userRequestPackage.reduxMiddlewareType === "redux-saga") {
          s.message("Getting pakages...redux-saga")
          let reduxmiddlewareversion = await latestVersion("redux-saga")
          currDependcies["redux-saga"] = reduxmiddlewareversion

          let writereduxSagaPath = path.join(extratemplatePath, userRequestPackage.reduxMiddlewareType, `saga.${fileType}`)
          let reduxContent = fs.readFileSync(writereduxSagaPath, "utf-8");
          fs.writeFileSync(`src/redux/action/config/store.${fileType}x`, reduxContent, "utf-8");

        }
      }
      if (userRequestPackage.CSSFramework !== "None") {
        switch (userRequestPackage.CSSFramework) {
          case "MUI":
            s.message("Getting pakages...MUI")
            let muiversion = await latestVersion("@mui/material")
            let emotionreactversion = await latestVersion("@emotion/react")
            let emotionstyledversion = await latestVersion("@emotion/styled")
            let postcssversion = await latestVersion("postcss-loader")

            currDependcies["@mui/material"] = muiversion;
            currDependcies["@emotion/react"] = emotionreactversion;
            currDependcies["@emotion/styled"] = emotionstyledversion;
            currDependcies["postcss-loader"] = postcssversion;

            break;

          case "Bootstrap":
            s.message("Getting pakages...Bootstrap")
            let boostrapversion = await latestVersion("bootstrap")
            let reactbootstrapversion = await latestVersion("react-bootstrap")
            let postcssloaderversion = await latestVersion("postcss-loader")
            let precssversion = await latestVersion("precss")
            let autoprefixerversion = await latestVersion("autoprefixer")
            let sassloaderversion = await latestVersion("sass-loader")

            currDependcies["react-bootstrap"] = reactbootstrapversion
            currDependcies["bootstrap"] = boostrapversion
            currDependcies["postcss-loader"] = postcssloaderversion
            currDependcies["precss"] = precssversion
            currDependcies["autoprefixer"] = autoprefixerversion
            currDependcies["sass-loader"] = sassloaderversion

            let bootstrapRoute = path.join(extratemplatePath, userRequestPackage.CSSFramework, `bootstrap.${fileType}`);
            let bootstrapContent = fs.readFileSync(bootstrapRoute, "utf-8");
            fs.writeFileSync(`src/index.${fileType}x`, bootstrapContent);


            break;

          case "TailwindCSS":
            s.message("Getting pakages...TailwindCSS")
            // `${typePackage} -D postcss-preset-env tailwindcss autoprefixer && ${typePackage} postcss-loader`
            let postcssenvversion = await latestVersion("postcss-preset-env")
            let tailwindcssversion = await latestVersion("tailwindcss")
            let autoprefixerversio = await latestVersion("autoprefixer")
            let postcssloader = await latestVersion("postcss-loader")

            currDevDependcies["postcss-preset-env"] = postcssenvversion
            currDevDependcies["tailwindcss"] = tailwindcssversion
            currDevDependcies["autoprefixer"] = autoprefixerversio
            currDevDependcies["postcss-loader"] = postcssloader

            createFileInFolder(targetPath, `postcss.config.cjs`, "")
            createFileInFolder(targetPath, `tailwind.config.cjs`, "")

            let postcssRoute = path.join(extratemplatePath, userRequestPackage.CSSFramework, `postcss.config.cjs`);
            let postcssContent = fs.readFileSync(postcssRoute, "utf-8");
            fs.writeFileSync(`postcss.config.cjs`, postcssContent);

            let tailwindRoute = path.join(extratemplatePath, userRequestPackage.CSSFramework, `tailwind.config.cjs`);
            let tailwindContent = fs.readFileSync(tailwindRoute, "utf-8");
            fs.writeFileSync(`tailwind.config.cjs`, tailwindContent);

            let indexcssRoute = path.join(extratemplatePath, userRequestPackage.CSSFramework, `index.css`);
            let indexcssContent = fs.readFileSync(indexcssRoute, "utf-8");
            fs.writeFileSync(`src/index.css`, indexcssContent);


            break;
          default:
            break;
        }
      }

      packageJson.dependencies = currDependcies;
      packageJson.devDependencies = currDevDependcies

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      s.stop("Files setup completed")
    } catch (err) {
      console.error('Error reading or parsing package.json:', err);
    }
  }
  return true;
}

const showMessage = async (folderName: string, packageManger: string) => {
  console.log("")
 console.log(`${pc.green(pc.bold(folderName) + " successfully created")}`)
  console.log(`${pc.italic(pc.underline("To run the project"))}`)
  console.log(`           ${pc.blue("cd " + pc.bold(folderName))}`)
  if(packageManger==="redux-saga") console.log(`           ${pc.blue(`${packageManger}`)}`)
  else console.log(`           ${pc.blue(`${packageManger} install`)}`)
  if(packageManger==="yarn") console.log(`           ${pc.blue(`${packageManger} dev`)}`)
  else console.log(`           ${pc.blue(`${packageManger} run dev`)}`)
  console.log(`${pc.red(pc.bold("Happy Coding!!!"))}`)
  console.log(`${pc.bold("Give a star⭐ to repo")} - https://github.com/amitkroutthedev/create-reactopack`)
};

const generateFolder = async () => {
  await init()
  let userresponse = await generateQuestionsForFolder();
 // console.log(userresponse)
  const projectChoice = userresponse.typeOFScript
  const projectName = userresponse.folderName
  const packageManager = userresponse.packageManger
  const fileType = projectChoice === "sample-react" ? "js" : "ts";
  const templatePath = path.join(__dirname, "protemplates", 'templates', projectChoice);
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
     addRouter: userresponse.packages.includes("react-router"),
     addAxios: userresponse.packages.includes("axios"),
     addRedux: userresponse.packages.includes("redux"),
     reduxMiddlewareType: userresponse.reduxMiddlewareType,
     CSSFramework: userresponse.cssFramework
   }
   createDirectoryContents(templatePath, projectName);
   await postProcess(options, packageManager, userRequestPackage, fileType);
   showMessage(projectName, packageManager);

}

generateFolder()