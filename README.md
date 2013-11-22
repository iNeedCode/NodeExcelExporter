NodeExcelExporter
=======
This [Node.js][1] script is exporting a excel sheet after fetching the data from a MySql database.

##Getting started
1. rename `dbConfig.json.sampe` to `dbConfig.json` and add your database credentials.
2. install the npm dependencies for this project with `npm install`

###execute Script
```
// Example
$ node index.js --majlis dortmund --from 08-2013 --to 09-2013
```
The **pattern** of this command line interface is structured as followed and it's required to use exactly this format:  

```
node <jsFile.js> --majlis <majlisID> --from <mm-yyyy> --to <mm-yyyy>
```

[1]: http://nodejs.org