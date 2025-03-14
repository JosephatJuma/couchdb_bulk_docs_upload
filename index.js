const bulk = require("./bulk_upload/bulk.js");
bulk("data.json").then(console.log).catch(console.error);
