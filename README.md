# create-nrs-web
It's a template based on create-next-app. The template provides bulti-in settings for the following items to make the website creation much esaier and flexible.
* Next.js
* Redux
* Redux middleware (choices: Redux-thunk/Redux-saga/Promise-middleware)
* Styled-Components: provides the basic flex-box layout
* Nelify file

And the following options.
* Proxy
* TypeScript
* Jest

## Usages
### 1. Create a new project

```

npx create-nrs-web

```

### 2. Modify README.md for the new project
### 3. Launch at the development environment
* Next.js

```

npm run dev

```

* Proxy

```

npm run proxy

```

* Test (Jest and Enzyme)

```

npm run test

```

### 4. Deploy to Nelify
* Commit and push to the Github repository
* Open Nelify and select the repository
* Deploy

## Demo
* [Demo site](https://create-nrs-web-demo.netlify.app/)

## Tutorial
* [create-nrs-web — A Way to Build the Next.js, Redux, and Styled-Components Website Efficiently](https://medium.com/a-layman/create-nrs-web-a-way-to-build-the-next-js-redux-and-styled-components-website-efficiently-e1605b56e81)

## Release notes
* 1.9.1: fix the bug for the new option
### 1.9.0: provide an option to enable React profiler in production
* 1.8.3: support Jest for TypeScript
### 1.8.0 provide the default Nelify file
### 1.7.0 provide the basic layout
* 1.6.6: fix the bug for git clone
* 1.6.5: fix the bug for git clone
### 1.6.3 support TypeScript
* 1.5.4: fix the bug for git clone
* 1.5.3: add a references
### 1.5.2: support the page level Redux's state modifications
* 1.4.1: add a reference
### 1.4.0: add test cases for Redux (Redux-thunk/Redux-saga)
* 1.3.7: fix the bug for redux-saga
* 1.3.6: fix the bug for the new branch's name
* 1.3.5: resolve merged confilcts
* 1.3.4: remove log messages
* 1.3.3: fix the bug when running on Windows

## References
### TypeScript
* [Jest + TypeScript：建置測試環境](https://titangene.github.io/article/jest-typescript.html)
* [ts-node 的那些坑](https://www.jianshu.com/p/cbd3bcdbb60b)
* [CONFIGURING JEST AND ENZYME IN CREATE REACT APP ON TYPESCRIPT](https://thetrevorharmon.com/blog/configuring-jest-and-enzyme-in-create-react-app-on-typescript)
* [Create react app typescript: testing with jest and enzyme](https://feralamillo.medium.com/create-react-app-typescript-testing-with-jest-and-enzyme-869fdba1bd3)

### Page level Redux
* [kirill-konshin/next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper#server-and-client-state-separation)
* [Next.js pre-rendering](https://nextjs.org/docs/basic-features/pages#two-forms-of-pre-rendering)
### Jest
* [Test Components in the Next.js- Part 2. Test Redux Components in different middlewares (Redux-thunk and Redux-saga)](https://medium.com/a-layman/test-components-in-the-next-js-part-2-test-redux-components-in-different-middlewares-49af5b0be7fd)
* [Test Components in the Next.js Project with Jest and Enzyme- Part 1. Steps for the Environment setting](https://medium.com/a-layman/test-components-in-the-next-js-7f4bc5fbaa92)
### Redux-saga
* [Redux Middleware- The differences between Redux-thunk and Redux-saga](https://medium.com/a-layman/redux-middleware-the-differences-between-redux-think-and-redux-saga-1e226f5a772a)
### npm
* [How to Publish an npx Command to Improve productivity?](https://medium.com/a-layman/how-to-publish-an-npx-command-to-improve-the-productivity-23c6480c176)
* [Publishing an npx command to npm](http://www.sheshbabu.com/posts/publishing-npx-command-to-npm/)
* [NodeJs 交互式命令行工具 Inquirer.js - 开箱指南](https://juejin.cn/post/6844903480700698638)
### Others
* [Day 28 of #100DaysOfCode: Create the Proxy for Next.js application](https://dev.to/jenhsuan/day-28-of-100daysofcode-create-the-proxy-for-next-js-application-28g7)


## About
* [Author](https://jenhsuan.github.io/ALayman/profile.html)
* [100DaysOfCode](https://dev.to/jenhsuan)
* [Medium](https://medium.com/a-layman)

