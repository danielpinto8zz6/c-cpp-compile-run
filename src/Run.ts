export class Run {
    private args: string;
    private executable: string;
    private directory: string;

    constructor(executable: string, directory: string, args: string) {
        this.executable = executable;
        this.directory = directory;
        this.args = args;
    }

    public get_executable_with_args(): string {
        return `./${this.executable} ${this.args}`;
    }

    public get_directory(): string {
        return this.directory;
    }

    public get_executable(): string {
        return this.executable;
    }

    public get_args(): string {
        return this.args;
    }
}
