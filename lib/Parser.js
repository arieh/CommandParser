function merge(target, obj) {
    if (!obj) return target;

    for (var key in obj) {
        target[key] = obj[key];
    }

    return target;
}

function CommandParser(name, desc, extra){
    this.name = name;
    this.desc = desc;
    this.extra = extra;

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
}

CommandParser.prototype = {
    processArgs : function(){
        var args = [].slice.call(process.argv), arg, i;

        function processArgument(raw) {
            var raw = raw.replace(/^-+/,'');
            return raw.split('=');
        }

        if (args[0]=='node') {
            args.splice(0,2);
        }else{
            args.shift();
        }

        for (i=0; arg=args[i]; i++) {
            if (arg.indexOf('-') < 0) {
                this.args.push(arg);
                continue;
            }
            arg = processArgument(arg);

            this.raw_arguments[arg[0]] = arg[1];
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
    printHelp : function(){
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

        console.log(out.join('\n\t'));
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