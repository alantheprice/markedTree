# This is a markdown viewer for viewing markdown within a development environment. 

A simple Single page app that is designed to make it simple to view markdown documentation within a project.

It is designed for well documented projects using many linked markdown files to document portions of the application. As long as all markdown files are linked with the main README.md, the markdown-viewer will find all linked markdown files and create a sidebar menu structure to mirror the directory stucture where linked documents appear.

### Usage

#### Install: Run `npm install marked-tree`

#### Integrate: 
The easiest way to integrate marked-tree into your project is to start it from the root of your project (assuming you have a README.md file at the root.)  Running it is as simple as adding a new npm script to your package.json like: `"document": "node node_modules/marked-tree/index.js"`.  You can then execute via `npm run-script document`. This will run the server that will build your markdown documentation tree. 

### [Changelog](./CHANGELOG.md)

#### Class Documentation

* [Link Class](./src/link.doc.md)
* [Markdown viewer Start](./src/main.doc.md)