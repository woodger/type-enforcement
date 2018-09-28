// Create document
let doc = {
  boo: true,
  now: new Date()
};


let pack = JSON.stringify(doc);
// '{"boo":true,"now":"2018-09-26T10:38:08.033Z"}'
//                    ^^^
//                    this is a string type

// ================ interworking ================

const TypeEnforcement = require('..');

// Declaring rules
const te = new TypeEnforcement({
	example: {
		boo: Boolean,
    now: Date
	}
});

let json = JSON.parse(pack);
// {boo: true, now: "2018-09-26T10:38:08.033Z"}
//                    ^^^
//                    it's still a string type

let data = te.normalise('example', json);
// { boo: true, now: 2018-09-26T10:35:41.345Z }
//                    ^^^
//                    this date type

console.log(data);
