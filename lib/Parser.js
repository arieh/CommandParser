function merge(target, obj) {
    if (!obj) return target;

    for (var key in obj) {
        target[key] = obj[key];
    }

    return target;
}

function CommandParser(opts){
    var //legacy support
        opts = typeof arguments[0] != 'string' ? opts : {
            name : arguments[0],
            desc : arguments[1],
            extra : arguments[2]
        },
        options = merge({
            name : '',
            desc : '',
            extra : '',
            arguments : {}
        }, opts);

    this.name = options.name;
    this.desc = options.desc;
    this.extra = options.extra;

    this.raw_arguments = {};
    this.arguments = {};
    this.args = [];
    this.length = 0;
    this.values = {};
    this.actions = {};

    this.processArgs();

    this.addArgument('help',{
        flags : ['h','help'],
        desc : 'help'
    });

    this.registerActions({
        help : this.printHelp.bind(this)
    });

    this.addArguments(options.arguments);
}

CommandParser.prototype = {
    processArgs : function(){
        var args = [].slice.call(process.argv), arg, i, processed;

        function processArgument(raw, args, index) {
            var re = /^-+/,
                dash = raw.match(re),
                split,
                res = [], i;

            if (!dash) return false;
            dash = dash[0];

            if (dash.length == 1) {
                for (i=1; i<=raw.length - 2 ; i++) {
                    res.push({name:raw[i], value:true});
                }

                if (args[index+1] && !args[index+1].match(re)) {
                    res.push({name:raw[i], value:args[index+1]});
                    res._skip = true;
                }else{
                    res.push({name:raw[i], value:true});
                }
            }else{
                split=raw.replace(re,'').split('=');
                res.push({
                    name:split[0],
                    value:split[1]?split[1]:true
                });
            }

            return res;
        }

        if (args[0]=='node') {
            args.splice(0,2);
        }else{
            args.shift();
        }

        for (i=0; arg=args[i]; i++) {
            processed = processArgument(arg,args,i);

            if (!processed) {
                this.args.push(arg);
                continue;
            }

            processed.forEach(function(arg){
                this.raw_arguments[arg.name] = arg.value;
            }.bind(this));

            if (processed._skip) i++;
        }
    },
    addArgument : function(name, opts) {
        this.arguments[name] = new Argument(name, opts);

        this.arguments[name].flags.forEach(function(flag){
            if (flag in this.raw_arguments) {
                this.arguments[name].setValue(this.raw_arguments[flag]);
                this.values[name] = this.arguments[name].value;
            }
        }.bind(this));

        if (opts.action) this.actions[name] = opts.action;
    },
    addArguments : function(args){
        var name;
        for (name in args) this.addArgument(name, args[name]);
    },
    isAnythingMissing : function() {
        var errors = [], arg, name;

        for (name in this.arguments){
            arg = this.arguments[name];
            if (!arg.optional) errors.push(arg.name);
        }

        if (errors.length) return errors;
        else return false;
    },
    get : function(name) {
        return this.arguments[name].value;
    },
    getArguments : function(){
        return this.args;
    },
    createHelpString : function(){
        var
            out = [
                "\tHelp for " + this.name,'',
                this.desc,''
            ],
            longest_flag = 0,
            flags = [],
            flag, name
            ;

        for (name in this.arguments) {
            l = 0;
            flag = this.arguments[name].flags
                .sort(function(a,b){return a.length > b.length})
                .map(function(f){
                    var str = (f.length==1) ? '-'+f:'--'+f;
                    l += str.length;
                    return str;
                });

            l+=2;
            if (l > longest_flag) longest_flag = l;

            flag.push(this.arguments[name].desc);
            flags.push(flag)
        }

        flags = flags.sort(function(a,b){return a.length > b.length});

        flags.forEach(function(f){
            var str;
            desc = f.pop();

            str = f.join(', ');
            str += new Array(longest_flag + 2 - str.length).join(' ');
            str+= desc;
            out.push(str);
        });

        out.push('',this.extra);

        return out.join('\n\t');
    },
    printHelp : function(){
        console.log(this.createHelpString());
    },
    registerActions : function(actions) {
        merge(this.actions, actions);
    },
    exec : function(){
        var name;

        for (name in this.values) {
            if (this.actions[name]) {
                this.actions[name](this.values[name], this);
            }
        }
    }
};

function Argument(name, opts){
    var
        opts = typeof opts == 'string' ? {desc:opts} : opts,
        options = merge({
            flags : [],
            desc : '',
            optional : true,
            action : function(){}
        }, opts)
    ;

    this.flags = options.flags;
    if (!this.flags.length) this.flags.push(name);
    this.name = name;

    this.desc = options.desc;
    this.optional = !!options.optional;

    this.setValue = function(value) {
        if (value == null) this.value = true;
        else this.value = value;
    };
}

exports.Parser = CommandParser;