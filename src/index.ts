import yargs from 'yargs';
import Merger from './lib/merger';
import { MatchStrategy } from './lib/phone-book';
import Logger from './lib/utils/logger';

const main = async () => {
  Logger.info(`Google Voice Takeout Merger v${process.env.npm_package_version}`);
  Logger.info();

  try {
    await yargs(process.argv.slice(2))
      .parserConfiguration({ 'parse-numbers': false })
      .scriptName('google-voice-takeout-merger')
      .wrap(yargs.terminalWidth())
      .demandCommand()
      .help()
      .option('verbose', {
        type: 'boolean',
        alias: 'v',
        default: false,
        description: 'Verbose mode'
      })
      .middleware(({ verbose }) => {
        Logger.init();
        Logger.setVerbose(verbose);
      })
      .command(
        'merge',
        'Merge all records',
        {
          'input-dir': {
            description: 'Input directory',
            type: 'string',
            alias: 'i',
            required: true
          },
          'output-dir': {
            description: 'Output directory',
            type: 'string',
            alias: 'o',
            required: true
          },
          contacts: {
            description: 'Contacts file (in VCF format)',
            type: 'string',
            alias: 'c',
            required: false
          },
          'suffix-length': {
            description: 'Shortest suffix to use for the suffix-based matching strategy',
            type: 'number',
            alias: 'sl',
            required: false
          },
          'generate-csv': {
            description: 'Generate a CSV index of all conversations',
            type: 'boolean',
            default: false,
            required: false
          },
          'generate-xml': {
            description: 'Generate an XML of all conversations which is suitable for use with SMS Backup and Restore',
            type: 'boolean',
            default: false,
            required: false
          },
          force: {
            type: 'boolean',
            alias: 'f',
            default: false,
            description: 'Overwrite output directory'
          },
          'ignore-call-logs': {
            type: 'boolean',
            default: false,
            description: 'Ignore call logs (Missed, Received, Placed, etc.)'
          },
          'ignore-orphan-call-logs': {
            type: 'boolean',
            default: false,
            description:
              'Ignore call logs (Missed, Received, Placed, etc.) from phone numbers which do not have any other conversations'
          },
          'ignore-media': {
            type: 'boolean',
            default: false,
            description: 'Ignore media attachments'
          },
          'ignore-voicemails': {
            type: 'boolean',
            default: false,
            description: 'Ignore voicemails'
          },
          'ignore-orphan-voicemails': {
            type: 'boolean',
            default: false,
            description: 'Ignore voicemails from phone numbers which do not have any other conversations'
          },
          'add-contact-names-to-xml': {
            type: 'boolean',
            default: false,
            description: 'Add names to SMS Backup and Restore exports (experimental)'
          },
          'append-phone-numbers-in-xml': {
            type: 'string',
            description:
              'Append this string to contact phone numbers in the SMS Backup and Restore exports (experimental)'
          },
          'prepend-phone-numbers-in-xml': {
            type: 'string',
            description:
              'Prepend this string to contact phone numbers in the SMS Backup and Restore exports (experimental)'
          },
          'replace-contact-apostrophes': {
            type: 'string',
            description: 'Replace apostrophes in contact names with this string (experimental)'
          },
          'use-last-timestamp': {
            type: 'boolean',
            default: false,
            description:
              'Use the timestamp of the last conversation file in output file names instead of the timestamp of the first conversation by default'
          }
        },
        async (
          {
            inputDir,
            outputDir,
            force,
            contacts,
            suffixLength,
            ignoreCallLogs,
            ignoreOrphanCallLogs,
            ignoreMedia,
            ignoreVoicemails,
            ignoreOrphanVoicemails,
            generateCsv,
            generateXml,
            addContactNamesToXml,
            appendPhoneNumbersInXml,
            prependPhoneNumbersInXml,
            replaceContactApostrophes,
            useLastTimestamp
          }
        ) => {
          try {
            let strategyOptions = {};
            let strategy: MatchStrategy;
            if (suffixLength && suffixLength > 0) {
              strategy = MatchStrategy.Suffix;
              strategyOptions = { suffixLength };
            } else {
              strategy = MatchStrategy.Exact;
            }

            const merger = new Merger({
              inputDir,
              outputDir,
              force,
              contacts,
              strategy,
              strategyOptions,
              ignoreCallLogs,
              ignoreOrphanCallLogs,
              ignoreMedia,
              ignoreVoicemails,
              ignoreOrphanVoicemails,
              generateCsv,
              generateXml,
              addContactNamesToXml,
              appendPhoneNumbersInXml,
              prependPhoneNumbersInXml,
              replaceContactApostrophes,
              useLastTimestamp
            });

            await merger.merge();
          } catch (e: unknown) {
            if (e instanceof Error) {
              Logger.error(e.stack);
            } else {
              Logger.error(e);
            }

            process.exit(1);
          }
        }
      )
      .parse();
  } catch (e) {
    if (e instanceof Error) {
      Logger.error(e.stack);
    } else {
      Logger.error(e);
    }

    process.exit(1);
  }
};

main();
