# Link class for managing a specific link instance. 

Holds and manipulates data for a link and has the following properties: 
* `isExternal`: {boolean} - identifies if the target of the link is an external url
* `directory`: {string} - the (project relative) directory path for the link
* `href`: {string} - the actual link reference path
* `hashLink`: {string} - the href converted with a hashTag at the beginning for a virtual reference.
* `linkText`: {string} - the actual visible text associated with a link instance.
* `markdownLoaded`: {boolean} - indicating whether the markdown file has been loaded already or not, needed since just checking for an empty string is not sufficient for the instance of an empty, but downloaded markdown file. 
* `markHtml`: {string} - the html string for the markdown file.  stored within the link object as an in memory cache so we don't reload the same file multiple times.

[fake Url to validate it handles broken paths](./fakeUrl.md);