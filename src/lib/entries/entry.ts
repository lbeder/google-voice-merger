import { sortBy } from 'lodash';
import { Moment } from 'moment';
import { HTMLElement } from 'node-html-parser';
import PhoneBook from '../phone-book';
import Logger from '../utils/logger';

export enum EntryFormat {
  JPG = 'JPG',
  GIF = 'GIF',
  MP3 = 'MP3',
  MP4 = 'MP4',
  THREEGP = '3GP',
  AMR = 'AMR',
  VCF = 'VCF',
  HTML = 'HTML'
}

export const EntryFormats = { ...EntryFormat };

export enum EntryType {
  HTML = 'HTML',
  Media = 'Media'
}

export enum EntryAction {
  Received = 'Received',
  Placed = 'Placed',
  Missed = 'Missed',
  Text = 'Text',
  Voicemail = 'Voicemail',
  Recorded = 'Recorded',
  GroupConversation = 'Group Conversation',
  Unknown = 'Unknown'
}
export const EntryActions = { ...EntryAction };

export interface SaveOptions {
  outputDir: string;
  useLastTimestamp: boolean;
}

export default abstract class Entry {
  public action: EntryAction;
  public type: EntryType;
  public format: EntryFormat;
  public name: string;
  public phoneNumbers: string[];
  public timestamp: Moment;
  public lastTimestamp: Moment;
  public fullPath: string;
  public savedPath?: string;
  protected html?: HTMLElement;

  protected static phoneBook: PhoneBook;

  // A running index of the currently processed number of group conversations.
  protected static gcCount = 0;

  public static UNKNOWN_PHONE_NUMBER = '+00000000000';

  constructor(
    action: EntryAction,
    type: EntryType,
    format: EntryFormat,
    name: string,
    phoneNumbers: string[],
    timestamp: Moment,
    fullPath: string
  ) {
    this.action = action;
    this.type = type;
    this.type = type;
    this.format = format;
    this.name = name;
    this.phoneNumbers = phoneNumbers.sort();
    this.timestamp = timestamp;
    this.lastTimestamp = timestamp;
    this.fullPath = fullPath;
  }

  public isMedia() {
    return this.type == EntryType.Media;
  }

  public isCallLog() {
    return [EntryAction.Recorded, EntryAction.Received, EntryAction.Placed, EntryAction.Missed].includes(this.action);
  }

  public isVoiceMail() {
    return this.action === EntryAction.Voicemail;
  }

  public isGroupConversation() {
    return this.action == EntryAction.GroupConversation;
  }

  public hasUnknownPhoneNumber() {
    return this.phoneNumbers.length === 1 && this.phoneNumbers[0] === Entry.UNKNOWN_PHONE_NUMBER;
  }

  public static setPhoneBook(phoneBook: PhoneBook) {
    this.phoneBook = phoneBook;
  }

  // Merges multiple entries and saves them in the provided output directory. Please note that this method requires all
  // the entries to belong to the same set of phone numbers (and will gracefully terminate if this isn't the case)
  public static merge(entries: Entry[], options: SaveOptions) {
    const sortedEntries = sortBy(entries, [(r) => r.timestamp.unix()]);

    let found = false;
    let firstEntry: Entry | undefined;
    const mediaEntries: Entry[] = [];

    Logger.debug(`Merging entries: ${sortedEntries.map((r) => r.name)}`);

    for (const entry of sortedEntries) {
      // Ensure that all the entries belong to the same set of phone numbers
      if (firstEntry && firstEntry.phoneNumbers.length !== entry.phoneNumbers.length) {
        throw new Error(
          `Unexpected phone numbers during merge: expected=${firstEntry?.phoneNumbers}, actual=${entry.phoneNumbers}`
        );
      }

      // Postpone processing of media entries after finishing processing all the HTML entries
      if (entry.isMedia()) {
        mediaEntries.push(entry);

        continue;
      }

      // Make sure that we have only single non-media entry in the set
      if (!found) {
        Logger.debug(`Found first entry: entry=${entry.name}`);

        firstEntry = entry;
        found = true;

        continue;
      }

      if (!firstEntry) {
        throw new Error('Unable to find the first entry');
      }

      firstEntry.merge(entry);
    }

    if (!firstEntry) {
      throw new Error('Unable to find the first entry');
    }

    // Merge all media entries full entry
    for (const mediaEntry of mediaEntries) {
      // Save the media entry and merge it to the final entry
      mediaEntry.save(options);

      firstEntry.merge(mediaEntry);
    }

    // Save the final entry
    firstEntry.save(options);

    return firstEntry;
  }

  // Saves the entry in the specified output directory
  abstract save(options: SaveOptions): void;

  // Lazily loads the contents of the entry (if supported)
  abstract load(): void;

  // Merges this entry with the provided entry (if supported)
  abstract merge(_entry: Entry): void;
}
