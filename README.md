CommandParser
============

CommandParser is a simple tool for parsing our commandline arguments, and printing help text for them.

## Usage

```js
var CommandLine = require('./lib/CommandParser').CommandParser,
	parser = new CommandLine("Command", "Description", "Extra text");

//simplest form
parser.addArgument('foo', 'assign a value to foo');

//with all arguments
parser.addArgument('bar' ,{
	flags : ['b','bar'], //default is name
	desc : "assign a value to foo", //default is ''
	optional : false //default is true
});


parser.printHelp();

/*
	Help for Command

	Description

	--foo      assign a value to foo
	-h, --help help
	-b, --bar  assign a value to foo

	Extra text
*/

//for the following command:
//$: Command -foo='a' -b a.js b.js

parser.get('foo');//a
parser.get('bar');//true
parser.getArguments();//['a.js','b.js']

//for the following command:
//$: Command -foo='a'

console.log(parser.isAnythingMissing());//['bar']
```
