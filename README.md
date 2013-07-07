Commandline Parser
============

CommandParser is a simple tool for parsing our commandline arguments, and printing help text for them.

## Installation

`npm install commandline-parser`

## Usage

### Registering arguments
```js
var CommandLine = require('commandline-parser').Parser,
	parser = new Parser({
		name : "command",
		desc : 'Description',
		extra : 'Extra text'
	});

//simplest form
parser.addArgument('foo', 'assign a value to foo');

//with all arguments
parser.addArgument('bar' ,{
	flags : ['b','bar'], //default is name
	desc : "assign a value to bar", //default is ''
	optional : false //default is true,
	action : function(value, parser){}
});
```
### Printing help text

```js
parser.printHelp();

/*
	Help for command

	Description

	--foo      assign a value to foo
	-h, --help help
	-b, --bar  assign a value to bar

	Extra text
*/
```

Also note, that the parser already pre-registers the `-h` and `--help` commands for the `printHelp` method


### Parsing arguments

```js
//for the following command:
//$: Command --foo='a' -b a.js b.js

parser.get('foo');//a
parser.get('bar');//true
parser.getArguments();//['a.js','b.js']


//If we want to test which required arguments are missing we can use
parser.isAnythingMissing();//returns an array of missing parameters
```

### Registering actions
You can use the parser to route arguments to functions:

```js
parser.registerActions({
	foo : function(value, parser){
		console.log('Foo was set with the value of ', value);
	}
});

parser.exec();//will execute all actions that have values assigned to them
```

## Full constructor options:

```js
parser  new Parser({
	name : "command",
	desc : 'Description',
	extra : 'Extra text',
	arguments : {
		foo : {
			flags : ['f'],
			optional : false,
			desc : 'description of command',
			action : function(value, parser){}
		}
	}
});

```

## An example of all possible argument assignments

```js
$: cmd -a -bcd -e aaa -fgh bbb --foo --bar=ccc ddd eee

/*
a:true
b:true
c:true
e:"aaa"
f:true
g:true
h:"bbb"
foo:tue
bar:ccc
getArguments:["ddd","eee"]
*/
```