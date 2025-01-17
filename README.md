# Google Voice Takeout Merger

[![Docs](https://img.shields.io/badge/docs-%F0%9F%93%84-blue)](https://github.com/lbeder/google-voice-takeout-merger)
[![Test](https://github.com/lbeder/google-voice-takeout-merger/actions/workflows/ci.yml/badge.svg)](https://github.com/lbeder/google-voice-takeout-merger/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/lbeder/google-voice-takeout-merger?style=flat-square)](https://github.com/lbeder/google-voice-takeout-merger/blob/master/LICENSE)

Currently, Google Voice breaks down each call/conversation into individual records, resulting in thousands of records for each participant/phone number. This can make exporting and using the data quite challenging. However, with the use of this tool, it becomes possible to merge all these records into a single, time-sorted record per participant.

The main features of this tool include:

* Merging and grouping Google Voice takeout records by participants:
  * Conversation/call records involving the same participant (or number of participants) are combined into a single entry, similar to how other services handle it.
  * All records are sorted based on timestamps, and the resulting filename includes the timestamp of the earliest record.
* Optional integration with a contacts VCF file for contact matching. See the  [Contact Matching](#contact-matching) section below for more details.
* Addressing media and metadata issues, such as broken links and style inconsistencies. It also converts video and audio attachments into proper HTML5 controls.
* Generating a CSV index file (named `index.csv`) that can be used separately with the Google Voice Takeout Viewer indexing app (available at [Google Voice Takeout Viewer](https://github.com/lbeder/google-voice-takeout-viewer)). Please note that the CSV timestamps are taken from the file names and not from the individual messages.
* Generating an XML file (named `sms.xml`) compatible with SMS Backup and Restore, which can be imported into an Android device. You can also view it using the web app Syntech View Backup Files (accessible at [Syntech View Backup Files](https://www.synctech.com.au/sms-backup-restore/view-backup/)).
* Reorganizing all media and metadata in a structured manner.
* Adding a list of participants to every record.
* Displaying contact names in the SMS Backup and Restore export.
* Properly merging records associated with unknown phone numbers into a single record.
* Experimental: Append or prepend a label to phone numbers in the SMS Backup and Restore export. This is useful when you plan to import multiple exports to the same user. This allows for visual differentiation between conversations you had with the same contacts using different phone numbers.

Please see the [Samples](#samples) section below:

## Installation

```sh
pnpm install
```

## Usage

```sh
google-voice-takeout-merger <command>

Commands:
  google-voice-takeout-merger merge  Merge all records

Options:
      --version  Show version number                                                                                                                  [boolean]
      --help     Show help                                                                                                                            [boolean]
  -v, --verbose  Verbose mode                                                                                                        [boolean] [default: false]
```

### Merge

```sh
google-voice-takeout-merger merge

Merge all records

Options:
      --version                       Show version number                                                                                                              [boolean]
      --help                          Show help                                                                                                                        [boolean]
  -v, --verbose                       Verbose mode                                                                                                    [boolean] [default: false]
  -i, --input-dir                     Input directory                                                                                                        [string] [required]
  -o, --output-dir                    Output directory                                                                                                       [string] [required]
  -c, --contacts                      Contacts file (in VCF format)                                                                                                     [string]
      --suffix-length, --sl           Shortest suffix to use for the suffix-based matching strategy                                                                     [number]
      --generate-csv                  Generate a CSV index of all conversations                                                                       [boolean] [default: false]
      --generate-xml                  Generate an XML of all conversations which is suitable for use with SMS Backup and Restore                      [boolean] [default: false]
  -f, --force                         Overwrite output directory                                                                                      [boolean] [default: false]
      --ignore-call-logs              Ignore call logs (Missed, Received, Placed, etc.)                                                               [boolean] [default: false]
      --ignore-orphan-call-logs       Ignore call logs (Missed, Received, Placed, etc.) from phone numbers which do not have any other conversations  [boolean] [default: false]
      --ignore-media                  Ignore media attachments                                                                                        [boolean] [default: false]
      --ignore-voicemails             Ignore voicemails                                                                                               [boolean] [default: false]
      --ignore-orphan-voicemails      Ignore voicemails from phone numbers which do not have any other conversations                                  [boolean] [default: false]
      --add-contact-names-to-xml      Add names to SMS Backup and Restore exports (experimental)                                                      [boolean] [default: false]
      --append-phone-numbers-in-xml   Append this string to contact phone numbers in the SMS Backup and Restore exports (experimental)                                  [string]
      --prepend-phone-numbers-in-xml  Prepend this string to contact phone numbers in the SMS Backup and Restore exports (experimental)                                 [string]
      --replace-contact-apostrophes   Replace apostrophes in contact names with this string (experimental)                                                              [string]
      --use-last-timestamp            Use the timestamp of the last conversation file in output file names instead of the timestamp of the first conversation by default
                                                                                                                                                      [boolean] [default: false
```

Please note that the `--replace-contact-apostrophes` and `--phone-number-padding-in-xml` require a string input (e.g., `--replace-contact-apostrophes="""` or `--replace-contact-apostrophes """` and `--phone-number-padding-in-xml=000` or `--phone-number-padding-in-xml 000`).

For example, you can merge the archive located in `~/in/Calls` to `~/out` like this:

```sh
pnpm merge -i ~/in/Calls -o ~/out
```

If you'd like the tool to overwrite the output folder and run in verbose mode, you can add the `-f` and `-v` flags respectively:

```sh
pnpm merge -i ~/in/Calls -o ~/out -v -f
```

Please note that the input should be the "Calls" folder from the original Google Voice Takeout zip export. Prior to generating the Takeout export, ensure that you have temporarily removed all contacts from your [Google Contacts](contacts.google.com) account. If contacts are not removed, the Takeout export will have phone numbers replaced with contact names in both the file names and the records themselves. This replacement will cause catastrophic filename truncation, and also the parsing and matching process of the tool will fail.

To easily remove all contacts, you can follow these steps:

1. Back up all your contacts through [Google Takeout](takeout.google.com). It also recommended to use the [Google Contacts](contacts.google.com) export function for each one of the individual contact folders. Both methods support CSV and VCF exports.
2. Delete all of your contacts through [Google Contacts](contacts.google.com) (including in the "Frequent" and "Other" folders).
3. Perform the Google Voice Takeout export and wait for it to finish.
4. After downloading the Google Voice Takeout export, in order to recover the contacts it is recommended to restore the contacts from the "Trash" folder on [Google Contacts](contacts.google.com).
5. Alternatively you can restore by importing either the [Google Takeout](takeout.google.com) export or the [Google Contacts](contacts.google.com) export, or use the built-in rollback option on [Google Contacts](contacts.google.com) which can restore your account to any state in the past 30 days.

### Node.js Memory Limit

In Node.js, there is a default limit of 4GB to the maximum amount of memory that the Node.js process can utilize. Since we are processing all the data in-memory, working with an especially large Google Voice Takeout may result in exceeding it.

To work around the default memory limit, you can adjust the `max-old-space-size` flag in Node.js. This flag allows you to specify the maximum amount of memory (in megabytes) that the old space can use. By increasing this value, you can allocate more memory to your Node.js process.

Here's how you can set the `max-old-space-size` flag to a higher value of `8192` (for example):

O Linux/Mac OS systems:

```sh
export NODE_OPTIONS="--max-old-space-size=8192"
pnpm merge

# OR
NODE_OPTIONS="--max-old-space-size=8192" pnpm merge
```

On Windows systems:

```sh
set NODE_OPTIONS="--max-old-space-size=8192"
pnpm merge
```

## Contact Matching

The tool supports receiving an optional contact VCF file (for example, from your [Google Contacts](https://support.google.com/contacts/answer/7199294)) and uses it to match phone numbers to contact names using one of the following matching strategies. If there are multiple contacts, in the VCF file, with an identical phone number, a warning message will be displayed. When a contact match is found its full name will be inserted in all matched threads (merged threads, CSV index, and XML export).

Please note that since there isn't a fully standardized way to add external names to SMS Backup and Restore compatible XML exports, adding them can produce some UX issues when importing it to your Android device. Therefore, contact names won't be added to SMS Backup and Restore compatible XML exports by default, unless the (experimental) `--add-contact-names-to-xml` flag is set.

If you plan to use the export mostly/only with a web viewer (such as [Syntech View Backup Files](https://www.synctech.com.au/sms-backup-restore/view-backup/) web app), setting the `--add-contact-names-to-xml` flag is highly recommended, since it'll also add the names to group conversations.

Please also note that these matching strategies are only applied when a contact VCF file is provided and there is a match with one of its contact records. If there are multiple suffix matches, the last one will be given priority, and a warning message will be displayed.

### Exact Matching Strategy

The default behavior is to try an exact match between the phone number in the record and in the contacts file.

For example, the following numbers will be matched:

* `+15155550117` and `+15155550117`
* `+12345678910` and `+12345678910`

But the following numbers won't be matched:

* `+15155550117` and `15155550117`
* `12345678910` and `2345678910`

### Suffix-based Matching Strategy

Unfortunately, we've noticed many discrepancies between phone numbers in the records and the contacts file (e.g., inconsistencies between international country calling code or just bugs). Therefore, we have provided an optional method to perform a suffix-based match instead.

The suffix-based match is enabled when the `--suffix-length/--sl` parameter for the shortest suffix length to use is provided. This parameter defines what is the length of the shortest (i.e., the worst-case scenario) suffix to match.

For example, if the shortest suffix length is set to `8`, the following phone numbers will be matched:

* `+12345678910` with `45678910` (shortest match of using a `8` digit suffix)
* `12345678910` with `345678910` (match of using a `9` digit suffix)
* `+12345678910` with `12345678910` (almost a full match, using a `10` digit suffix)

The matching algorithm will constantly try to find the longest match, to eliminate false positives. In addition, the algorithm works in both of the directions and can match partial phone numbers from either the records or the contact file.

We would recommend the following values:

* `9`: extra safe and conservative
* `8`: optimal (based on our observations)
* `7`: relatively safe, but there is a chance of false positives
* `6`: risky and usually with false positives

The likelihood of a wrong contact name matching increases as the suffix length becomes shorter.

In addition, please also note the `matched_numbers.csv` and the `unknown_numbers.csv` logs for additional matching information.

## Samples

Please see the provided example input and output in [docs/samples](docs/samples). This input includes many examples of invalid and buggy Google Voice records, we have encountered, thus showcases many of the fixes that this tool is performing during the merge process.

**All the phone numbers, contacts, media, and data uses fake and sample data.**

### Regular

We will execute the following command:

```sh
pnpm merge -f -i ./docs/samples/regular/in/Calls -o ./docs/samples/regular/out -c ./docs/samples/regular/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml

In the of the execution, you should expect the following summary:

```sh
[2023/06/23 12:30:13.401] Summary:
[2023/06/23 12:30:13.401] ¯¯¯¯¯¯¯¯
[2023/06/23 12:30:13.402] Total entries: 46
[2023/06/23 12:30:13.402]
[2023/06/23 12:30:13.402] Types:
[2023/06/23 12:30:13.402]     HTML: 31
[2023/06/23 12:30:13.402]     Media: 15
[2023/06/23 12:30:13.402]
[2023/06/23 12:30:13.402] Actions:
[2023/06/23 12:30:13.402]     Received: 5
[2023/06/23 12:30:13.402]     Placed: 3
[2023/06/23 12:30:13.402]     Missed: 5
[2023/06/23 12:30:13.402]     Text: 17
[2023/06/23 12:30:13.402]     Voicemail: 8
[2023/06/23 12:30:13.402]     Recorded: 0
[2023/06/23 12:30:13.402]     Group Conversation: 8
[2023/06/23 12:30:13.402]     Unknown: 0
[2023/06/23 12:30:13.402]
[2023/06/23 12:30:13.402] Formats:
[2023/06/23 12:30:13.402]     JPG: 5
[2023/06/23 12:30:13.403]     GIF: 1
[2023/06/23 12:30:13.403]     MP3: 4
[2023/06/23 12:30:13.403]     MP4: 2
[2023/06/23 12:30:13.403]     3GP: 1
[2023/06/23 12:30:13.403]     AMR: 1
[2023/06/23 12:30:13.403]     VCF: 1
[2023/06/23 12:30:13.403]     HTML: 31
[2023/06/23 12:30:13.403]
[2023/06/23 12:30:13.403] Phone number matching:
[2023/06/23 12:30:13.403]     Total VCF contacts matched: 13
[2023/06/23 12:30:13.403]     Total unique record numbers matched: 13
[2023/06/23 12:30:13.403]     Total unknown numbers: 22
[2023/06/23 12:30:13.403]     Total numbers: 35
[2023/06/23 12:30:13.403]
[2023/06/23 12:30:13.403] Generated CSV index at: ~/google-voice-takeout-merger/docs/samples/out/index.csv
[2023/06/23 12:30:13.403] Generated SMS Backup and Restore XML export: ~/google-voice-takeout-merger/docs/samples/out/sms.xml
[2023/06/23 12:30:13.403]
[2023/06/23 12:30:13.403] See the logs directory ~/google-voice-takeout-merger/docs/samples/out/logs for lists of known/unknown numbers
[2023/06/23 12:30:13.403]
[2023/06/23 12:30:13.403] Please let the tool a few moments to finish
```

For example, you could see that all the records for `+17015550147`:

* [docs/samples/in/Calls/+17015550147 - Text - 2022-03-09T08_00_32Z-2-1.jpg](docs/samples/in/Calls/+17015550147%20-%20Text%20-%202022-03-09T08_00_32Z-2-1.jpg)
* [docs/samples/in/Calls/+17015550147 - Text - 2022-03-09T08_00_32Z.html](docs/samples/in/Calls/+17015550147%20-%20Text%20-%202022-03-09T08_00_32Z.html)
* [docs/samples/in/Calls/+17015550147 - Voicemail - 2022-03-09T08_01_50Z.html](docs/samples/in/Calls/+17015550147%20-%20Voicemail%20-%202022-03-09T08_01_50Z.html)
* [docs/samples/in/Calls/+17015550147 - Voicemail - 2022-03-09T08_01_50Z.mp3](docs/samples/in/Calls/+17015550147%20-%20Voicemail%20-%202022-03-09T08_01_50Z.mp3)
* [docs/samples/in/Calls/+17015550147 - Voicemail - 2022-03-09T08_03_00Z.html](docs/samples/in/Calls/+17015550147%20-%20Voicemail%20-%202022-03-09T08_03_00Z.html)
* [docs/samples/in/Calls/+17015550147 - Voicemail - 2022-03-09T08_03_00Z.mp3](docs/samples/in/Calls/+17015550147%20-%20Voicemail%20-%202022-03-09T08_03_00Z.mp3)

Have been merged into a single record:

* [docs/samples/out/+17015550147/2022-03-09T08_00_32 +17015550147.html](docs/samples/out/+17015550147/2022-03-09T08_00_32%20%2B17015550147.html)

Before:

<kbd>
  <img src="docs/images/2022-03-09T08_00_32%20%2B17015550147-before.png" alt="before"/>
</kbd>

\
After:

<kbd>
  <img src="docs/images/2022-03-09T08_00_32%20%2B17015550147-after.png" alt="after"/>
</kbd>

In addition, all the records with an unknown phone numbers have been merged into:

* [docs/samples/out/+00000000000/2011-10-27T23_07_36 +00000000000.html](docs/samples/out/+00000000000/2011-10-27T23_07_36%20%2B00000000000.html)

You can view the `--generate-xml` SMS Backup and Restore compatible export via [Syntech View Backup Files](https://www.synctech.com.au/sms-backup-restore/view-backup/) web app:

<kbd>
  <img src="docs/images/Syntech%20-%20View%20Backup%20Files.png" alt="syntech"/>
</kbd>

Please note that contact matching and "total numbers" counts include phone numbers belonging to the Google Voice account itself (usually just the main account number but may include others if the Google Voice number was changed and includes historic activity from those previous phone numbers).

### Filter: Call Logs

```sh
pnpm merge -f -i ./docs/samples/filter-call-logs/in/Calls -o ./docs/samples/filter-call-logs/out -c ./docs/samples/filter-call-logs/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --ignore-call-logs
```

### Filter: Orphan Call Logs

```sh
pnpm merge -f -i ./docs/samples/filter-orphan-call-logs/in/Calls -o ./docs/samples/filter-orphan-call-logs/out -c ./docs/samples/filter-orphan-call-logs/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --ignore-orphan-call-logs
```

### Filter: Voicemails

```sh
pnpm merge -f -i ./docs/samples/filter-voicemails/in/Calls -o ./docs/samples/filter-voicemails/out -c ./docs/samples/filter-voicemails/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --ignore-voicemails
```

### Filter: Orphan Voicemails

```sh
pnpm merge -f -i ./docs/samples/filter-orphan-voicemails/in/Calls -o ./docs/samples/filter-orphan-voicemails/out -c ./docs/samples/filter-orphan-voicemails/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --ignore-orphan-call-logs
```

### Filter: Media

```sh
pnpm merge -f -i ./docs/samples/filter-media/in/Calls -o ./docs/samples/filter-media/out -c ./docs/samples/filter-media/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --ignore-media
```

### Filter: Use the Timestamp of the Last Conversation File In Output File Names

```sh
pnpm merge -f -i ./docs/samples/use-last-timestamp/in/Calls -o ./docs/samples/use-last-timestamp/out -c ./docs/samples/use-last-timestamp/in/contacts.vcf --sl 8 --generate-csv --generate-xml --add-contact-names-to-xml --use-last-timestamp
```

#### Syntech  View Backup Files Known Issues

Please note that this tool currently has a few issues:

1. Videos can't be viewed properly (due to a bug in `KXmlParser.js`)
2. Some video codecs (`amr` and some `mp4`) can't be played in some browsers.
3. It's not possible to browse into conversations whose participants names contain the `'` (apostrophe/single quote) mark. In these cases, we recommend replacing the apostrophes using the `--replace-contact-apostrophes` flag. For example:
    * `--replace-contact-apostrophes=""`: remove all apostrophes.
    * `--replace-contact-apostrophes="""`: replace all apostrophes with double quotes.
4. It seems to be merging conversations whose phone numbers end with the same 8-digits/characters suffix, therefore using the `--append-phone-numbers-in-xml` option may result in merging of unrelated conversations
