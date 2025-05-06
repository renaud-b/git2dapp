class Project {
    constructor(name, owner) {
        this.name = null;
        this.user = null;
        this.files = [];
    }

    set(name, files = []) {
        this.name = name;
        this.files = files;
    }

    getFile(path) {
        return this.files.find((f) => (f.file.path === path));
    }
};