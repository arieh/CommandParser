var Parser = require('../lib/Parser').Parser;
var assert = require('assert');

function merge(target, obj) {
    if (!obj) return target;

    for (var key in obj) {
        target[key] = obj[key];
    }

    return target;
}

function createParser(options) {
    return new Parser(merge({
        name : "test",
        desc : "A test command line tool",
        extra : "Extra stuff"
    }, options));
}

describe("Parser Spec", function(){
    var args;

    beforeEach(function(){
        args = process.argv;
        process.argv = ['node','file.js'];
    });

    afterEach(function(){
        process.argv = args;
    });

    it("Should receive the right number of argumens", function(){
        process.argv.push("-f","--bar=1");
        var parser = createParser({
            arguments : {
                "foo" : {
                    flags : ['f','foo']
                },
                "bar" : {}
            }
        });

        assert.equal(parser.get('foo'), true);
        assert.equal(parser.get('bar'),1);
    });

    it("Should print help text in the proper order", function(){
        var parser = createParser({
                arguments : {
                    "foo" : {
                        flags : ['f','foo'],
                        desc : "Foo"
                    },
                    "bar" : {desc:"Bar"},
                    "baz" : {
                        desc : "Baz",
                        flags : ['b', 'baz']
                    }
                }
            }),
            foo = '-f, --foo',
            bar = '--bar',
            baz = '-b, --baz',
            help = '-h, --help',
            str = parser.createHelpString(),
            args = ['bar','baz', 'foo'],
            indexes = [
                str.indexOf(bar),
                str.indexOf(foo),
                str.indexOf(baz)
            ];

        indexes.forEach(function(index, i) {
            assert.notEqual(index, -1);
            if (i>0) {
                assert.equal(index > indexes[i-1], true, args[i] + " Should come after " +args[i-1]);
            }
        });
    });

    it('Should find that a required variable is missing', function(){
        process.argv.push('-b');
        var parser = createParser({
            arguments : {
                'foo' :{optional:false},
                'bar' :{flags:['b']},
                'baz' :{optional:false}
            }
        });

        assert.deepEqual(['foo','baz'], parser.isAnythingMissing());
    });

    it("Should support registered actions", function(){
        process.argv.push('-f','--bar=a b c','--baz=1');
        var results = {},
            parser  = createParser({
                arguments : {
                    'foo' :{action:function(value){results['foo'] = value;}, flags : ['f']},
                    'bar' :{action:function(value){results['bar'] = value;}},
                    'baz' :{action:function(value){results['baz'] = value;}}
                }
            });

            parser.exec();

            assert.deepEqual(results, {'foo':true,'bar':'a b c', 'baz':1});
    });
});