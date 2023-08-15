const newman = require('newman');
const fs = require('fs-extra');

// Replace 'path/to/your/postman_collection.json' with the actual path to your Postman collection JSON file
const projectName = "register-x";
const postmanFile = "register-x.postman_collection.json";
const collectionFile = `C:/Users/v8/Desktop/Workspace/RioCard/Projetos/${projectName}/docs/${postmanFile}`;

// Change your branch witch correct name (master - develop/oracle)
const branch = "oracle";
const outputFolder = `responses-${branch}`;

// Run the Postman collection
newman.run({
    collection: require(collectionFile),
    reporters: 'cli',
}).on('start', function (err, args) {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }
}).on('request', function (err, args) {
    const folderName = args.item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${folderName}.${args.item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

    const body = args.request.body ? JSON.stringify(args.request.body) : "";
    const headersMembers = args.request.headers.members.filter(member => member.key !== 'Postman-Token');

    args.request.headers.members = headersMembers;

    const response = {
        request: {
            method: args.request.method,
            url: args.request.url.toString(),
            headers: args.request.headers,
            body: body === "" ? "" : JSON.parse(body),
        },

        response: {
            code: args.response ? args.response.code : "",
            body: args.response ? JSON.parse(args.response.stream.toString()) : "",
        },
    };

    fs.writeFileSync(`${outputFolder}/${fileName}`, JSON.stringify(response, null, 2));
}).on('done', function (err, summary) {
    if (err || summary.error) {
        console.error('Collection run encountered an error.');
    } else {
        console.log('Collection run completed.');
    }
});