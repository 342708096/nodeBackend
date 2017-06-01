var fs = require('fs');
var fse = require('fs-extra');

exports.read = function(file) {
	return fs.readFileSync(file, 'utf8');
};

exports.readJson = function(file) {
    return fse.readJsonSync(file);
}

exports.writeJson = function(file, obj) {
    return fse.writeJsonSync(file, obj);
}

exports.write = function(file, content) {
    if (file.indexOf('/') >= 0) {
        var folder = file.replace(/\/[^/]+$/, "");
        if (!exports.isDir(folder)) {
            fse.mkdirpSync(folder);
        }
    }
    
	return fs.writeFileSync(file, content, 'utf8');
};

exports.list = function(dir, filter) {
    if (!exports.isDir(dir)) 
        return [];
    
	var result = fs.readdirSync(dir);
	if (filter) {
		result = result.filter(function(one) { 
			return one.indexOf(filter) === one.length - filter.length; 
		});
	}
	return result;
};

exports.delete = function(file) {
    try {
    fs.unlinkSync(file);
        } catch (e) { return false; }
    
    return true;
};

exports.isDir = function(name) {
    try {
    return fs.lstatSync(name).isDirectory();
        } catch (e) { return false; }
};

exports.isFile = function(name) {
    try {
    return fs.lstatSync(name).isFile();
        } catch (e) { return false; }
};
            
exports.exists = function(name) {
    try {
        var l = fs.lstatSync(name);
        return l.isDirectory() || l.isFile();
        } catch (e) { return false; }
};
