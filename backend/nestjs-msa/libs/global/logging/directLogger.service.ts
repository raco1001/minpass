import { ConsoleLogger, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { promises as fsPromises } from "fs";

@Injectable()
export class DirectLoggerService extends ConsoleLogger {
  async logToFile(entry: string) {
    const formattedEntry = `${Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Seoul",
    }).format(new Date())}\t${entry}\n`;

    const logDir = path.join(__dirname, "..", "..", "..", "logs");
    const logFile = path.join(logDir, "app.log");

    try {
      if (!fs.existsSync(logDir)) {
        await fsPromises.mkdir(logDir);
      }
      await fsPromises.appendFile(logFile, formattedEntry);
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }

  log(message: unknown, context?: string) {
    const entry = `${context}\t${String(message)}`;
    this.logToFile(entry);
    super.log(message, context);
  }

  error(message: unknown, stackOrContext?: string) {
    const entry = `${stackOrContext}\t${String(message)}`;
    this.logToFile(entry);
    super.error(message, stackOrContext);
  }
}
