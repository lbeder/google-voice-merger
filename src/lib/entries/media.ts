import fs from 'fs';
import path from 'path';
import { Moment } from 'moment';
import Logger from '../utils/logger';
import Entry, { EntryAction, EntryFormat, EntryType, SaveOptions } from './entry';

export default class MediaEntry extends Entry {
  public relativePath?: string;

  private static MEDIA_DIR = 'media';

  constructor(
    action: EntryAction,
    format: EntryFormat,
    name: string,
    phoneNumbers: string[],
    timestamp: Moment,
    fullPath: string
  ) {
    super(action, EntryType.Media, format, name, phoneNumbers, timestamp, fullPath);
  }

  public save(options: SaveOptions) {
    const key = this.isGroupConversation()
      ? `${EntryAction.GroupConversation} ${Entry.gcCount + 1}`
      : this.phoneNumbers.join(',');

    this.relativePath = path.join(MediaEntry.MEDIA_DIR, this.name);

    const outputMediaDir = path.join(options.outputDir, key, MediaEntry.MEDIA_DIR);
    const outputPath = path.join(outputMediaDir, this.name);

    Logger.debug(`Saving media entry "${this.name}" to "${outputPath}"`);

    fs.mkdirSync(outputMediaDir, { recursive: true });
    fs.copyFileSync(this.fullPath, outputPath);

    this.savedPath = outputPath;
  }

  public load() {
    throw new Error('Unsupported operation');
  }

  public merge(_entry: Entry) {
    throw new Error('Unsupported operation');
  }
}
