#!/usr/bin/env node
const chalk = require("chalk");
const readline = require("readline");
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const packageJson = require("../template/package.json");
const { exec } = require("child_process");

/*
初始化配置
*/
const createOptions = {
    rootDir: '', //工程目录
    workDir: '', //工作目录
    name: 'no_name',
} ;

const greeting = chalk.white.bold("Welcome to belle-react-cli create application!") ;

const warning = chalk.white.bold("(we only support react temporarily.)");

console.log(greeting, warning);

//设置项目名
function initEnvironment() {
    if (process.argv.length < 3 || !process.argv[2]) {
        console.log(chalk.red("need project name"));
        process.exit(-1);
    }

    createOptions.name = process.argv[2];    //项目名
    createOptions.rootDir = path.resolve(__dirname, '../');
    createOptions.workDir = path.resolve(process.cwd(), createOptions.name);


    if (fs.existsSync(createOptions.workDir)) {
        console.log(chalk.red("project directory is already exist!"));
        process.exit(-1);
    }
}

//设置依赖(package.json)
function setDependencies() {
    fs.mkdirSync(createOptions.workDir, {recursive: true});
    const packageFile = path.resolve(createOptions.workDir, 'package.json');
    const writer = fs.createWriteStream(packageFile);
    writer.write(JSON.stringify({
        ...packageJson,
        name:createOptions.name //项目名
    }, null, 2));
    writer.close();
}

//设置.gitignore
function setDotGitignore() {
    const dotGitignoreStr = `
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
    ` ;
    fs.mkdirSync(createOptions.workDir, {recursive: true});
    const dotGitignoreFile = path.resolve(createOptions.workDir, '.gitignore');
    const writer = fs.createWriteStream(dotGitignoreFile);
    writer.write(dotGitignoreStr);
    writer.close();
}

// 从模版拷贝文件
function copyFiles() {
    // 拷贝文件
    [
        // ".gitignore" ,
        "README.md",
        "tsconfig.json" ,
    ].forEach((fileDir)=>{
        fs.copySync(
            path.resolve(createOptions.rootDir,`template/${fileDir}`) ,   //源
            path.resolve(createOptions.workDir,fileDir) //目标
        )
    });
    // 拷贝文件夹
    [
        "public" ,
        "src"
    ].forEach((folderDir)=>{
        const source = path.resolve(createOptions.rootDir,`template/${folderDir}`) ;    //源 ;
        const target = path.resolve(createOptions.workDir,folderDir) ;   //目标 
        fs.mkdirSync(target, {recursive: true});
        fs.copySync(source,target) ;
    });
}

const create = async() => {
    initEnvironment();
    setDependencies();
    setDotGitignore();
    copyFiles();

    exec(`cd ${createOptions.workDir} `, (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red("failed"));
            return;
        }

        console.log(chalk.greenBright.bold(`Success, please cd ./${createOptions.name} and run npm or yarn install in your project.`));
    });
}

create();