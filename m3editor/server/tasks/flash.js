var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var execSync = require('exec-sync');
var ROOT = path.normalize(path.join(__dirname, "../.."));

desc('Сборка flash-приложения');
task('flash', ['flash:compile', 'flash:config']);

namespace('flash', function() {
    desc('Компиляция исходников в flash-приложения');
    task('compile', [], function() {
        if (!process.env.FLEX_SDK_HOME) {
            console.log("$FLEX_SDK_HOME variable is missing;");
            console.log();
            console.log("Please download Flex SDK 4.6 or later from website");
            console.log("and set variable in a proper way");
            throw new Error("Flash compilation error");
        }

        var playerBindingsFolder = path.join(process.env.FLEX_SDK_HOME, "frameworks/libs/player");
        var playerBindingsPath = path.join(playerBindingsFolder, "11.1/playerglobal.swc");
        if (!fs.existsSync(playerBindingsPath)) {
            console.log("Flash Player bindings for expected version not found;");
            console.log();
            console.log("Please download file http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_0.swc");
            console.log("and save it as " + playerBindingsPath);
            throw new Error("Flash compilation error");
        }

        var commit = execSync("if [ -f " + path.join(ROOT, "REVISION") + " ]; then cat REVISION; else git rev-parse HEAD; fi");

        var cmd = [
            "PLAYERGLOBAL_HOME=" + playerBindingsFolder,
            path.join(process.env.FLEX_SDK_HOME, "/bin/mxmlc"),
            "-target-player=11",
            "-define=CONFIG::build,\"'" + commit + "'\"",
            "-verbose-stacktraces",
            "-include-libraries",
            path.join(ROOT, "editor/libs/PureMVC_AS3_2_0_3.swc"),
            "-source-path=" + path.join(ROOT, "editor/src"),
            "-output",
            path.join(ROOT, "server/public/editor/Match3Editor.swf"),
            "--",
            path.join(ROOT, "editor/src/Match3Editor.mxml"),
            "2>&1"
        ].map(function(opt) {
            return opt.replace(/(\s)/, "\\ ");
        }).join(' ');
        console.log("Compiling Match3Editor.swf");
        console.log("Compilation command: " + cmd);
        exec(cmd, function(err, stdout, stderr) {
            if (err) {
                console.log("Error encountered: " + err);
                console.log(stdout);
                throw new Error("Flash compilation error");
            }
            complete();
        });
    }, true);

    desc('Настройка конфигурационных файлов для флэша');
    task('config', [], function() {
        console.log("Creating flash configuration file");
        var targetPath = path.join(ROOT, 'server/public/editor/conf.txt');
        if (process.env.PUBLIC_HOST) {
            var publicPath = (process.env.PUBLIC_PATH || "").replace(/^\//,'');
            var publicHost = process.env.PUBLIC_HOST;
            var config = "host=http://" + path.join(publicHost, publicPath);
            fs.writeFile(targetPath, config, {encoding: 'UTF8'}, function (err) {
                if (err) {
                    console.log("Errow writing configuration file " + targetPath);
                    throw new Error(err);
                }
                complete();
            });
        } else {
            var configPath = path.join(ROOT, 'editor/conf', process.env.NODE_ENV + '.txt');
            fs.readFile(configPath, {encoding: 'UTF8'}, function (err, data) {
                if (err) {
                    console.log("Errow reading configuration flash file for current NODE_ENV " + process.env.NODE_ENV);
                    console.log("File: " + configPath);
                    throw new Error(err);
                }
                fs.writeFile(targetPath, data, {encoding: 'UTF8'}, function (err) {
                    if (err) {
                        console.log("Errow writing configuration file " + targetPath);
                        throw new Error(err);
                    }
                    complete();
                });
            });

        }
    }, true);
});
