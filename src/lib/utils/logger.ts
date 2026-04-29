type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
    private isDevelopment = import.meta.env.DEV;
    private prefix = "[KnowledgerTokenUpdater]";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private log(level: LogLevel, message: string, ...args: any[]) {
        if (!this.isDevelopment && level === "debug") return;

        const formattedMessage = `${this.prefix} [${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;

        switch (level) {
            case "debug":
                // eslint-disable-next-line no-console
                console.debug(formattedMessage, ...args);
                break;
            case "info":
                // eslint-disable-next-line no-console
                console.info(formattedMessage, ...args);
                break;
            case "warn":
                console.warn(formattedMessage, ...args);
                break;
            case "error":
                console.error(formattedMessage, ...args);
                break;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug(message: string, ...args: any[]) {
        this.log("debug", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info(message: string, ...args: any[]) {
        this.log("info", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn(message: string, ...args: any[]) {
        this.log("warn", message, ...args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(message: string, ...args: any[]) {
        this.log("error", message, ...args);
    }
}

export const logger = new Logger();
