import xml from 'xml';

export enum MessageType {
  Received = 1,
  Sent = 2,
  Draft = 3,
  Outbox = 4
}

enum MMSMessageType {
  Received = 132,
  Sent = 128
}

enum MessageReadStatus {
  Unread = 0,
  Read = 1
}

enum MessageStatus {
  None = -1,
  Complete = 0,
  Pending = 32,
  Failed = 64
}

enum AddressType {
  BCC = 129,
  CC = 130,
  To = 151,
  From = 137
}

export interface Media {
  contentType: string;
  name: string;
  data: Buffer;
}

interface Part {
  cd?: string;
  chset?: string;
  cid?: string;
  cl?: string;
  ct: string;
  ctt_s?: string;
  ctt_t?: string;
  data?: string;
  fn?: string;
  name?: string;
  seq: number;
  text: string;
}

export interface Participant {
  phoneNumber: string;
  name?: string;
}

export interface MessageParams {
  type: MessageType;
  target?: string;
  targetName?: string;
  sender: string;
  me?: string;
  participants: Participant[];
  unixTime: number;
  text: string;
  media: Media[];
  isGroupConversation: boolean;
  appendPhoneNumbersInXml?: string;
  prependPhoneNumbersInXml?: string;
}

export default class Message {
  private type: MessageType;
  private me?: string;
  private target?: string;
  private targetName?: string;
  private sender: string;
  private participants: Participant[];
  private unixTime: number;
  private text: string;
  private isGroupConversation: boolean;
  private media: Media[];
  private appendPhoneNumbersInXml: string;
  private prependPhoneNumbersInXml: string;

  private static NULL = 'null';
  private static DEFAULT_SMS_PROTOCOL = 0;
  private static CHARSET_UTF8 = 106;
  private static MMS_CONTENT_TYPE = 'application/vnd.wap.multipart.relate';
  private static READ_REPORT = 129;

  constructor({
    type,
    target,
    targetName,
    sender,
    me,
    participants,
    unixTime,
    text,
    media,
    isGroupConversation,
    appendPhoneNumbersInXml,
    prependPhoneNumbersInXml
  }: MessageParams) {
    if (!target && !isGroupConversation) {
      throw new Error('Missing target');
    }

    this.type = type;
    this.target = target;
    this.targetName = targetName;
    this.sender = sender;
    this.me = me;
    this.participants = participants;
    this.unixTime = unixTime;
    this.text = text;
    this.media = media;
    this.isGroupConversation = isGroupConversation;
    this.appendPhoneNumbersInXml = appendPhoneNumbersInXml ?? '';
    this.prependPhoneNumbersInXml = prependPhoneNumbersInXml ?? '';
  }

  public toSMSXML(): xml.XmlObject {
    if (this.isGroupConversation || this.media.length > 0) {
      return this.toMMS();
    }

    return this.toSMS();
  }

  private toSMS(): xml.XmlObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attr: Record<string, any> = {
      address: `${this.prependPhoneNumbersInXml}${this.target}${this.appendPhoneNumbersInXml}`,
      body: this.text,
      date: this.unixTime,
      protocol: Message.DEFAULT_SMS_PROTOCOL,
      read: MessageReadStatus.Read,
      sc_toa: Message.NULL,
      service_center: Message.NULL,
      status: MessageStatus.Complete,
      subject: Message.NULL,
      toa: Message.NULL,
      type: this.type
    };

    if (this.targetName) {
      attr.contact_name = this.targetName;
    }

    return {
      sms: [
        {
          _attr: attr
        }
      ]
    };
  }

  private toMMS(): xml.XmlObject {
    const sentByMe =
      (this.me && this.sender == this.me) || !this.participants.find((p) => p.phoneNumber === this.sender);
    const msgBox = sentByMe ? MessageType.Sent : MessageType.Received;
    const mType = sentByMe ? MMSMessageType.Sent : MMSMessageType.Received;

    const participants = [];
    let mePhoneNumber: string | undefined;
    for (const { phoneNumber } of this.participants) {
      const isSender = this.sender === phoneNumber;
      const isMe = this.me == phoneNumber;
      if (isMe) {
        if (mePhoneNumber) {
          throw new Error(`Multiple owners detected in: ${this.participants}`);
        }

        mePhoneNumber = phoneNumber;
      }

      participants.push({
        addr: [
          {
            _attr: {
              address: isSender
                ? phoneNumber
                : `${this.prependPhoneNumbersInXml}${phoneNumber}${this.appendPhoneNumbersInXml}`,
              charset: Message.CHARSET_UTF8,
              type: isSender || isMe || sentByMe ? AddressType.From : AddressType.To
            }
          }
        ]
      });
    }

    let seq = 0;

    const mediaParts: Part[] = [
      {
        ct: 'text/plain',
        seq: seq++,
        text: this.text
      }
    ];

    for (const media of this.media) {
      mediaParts.push({
        cd: Message.NULL,
        chset: Message.NULL,
        cid: `<${media.name}>`,
        cl: media.name,
        ct: media.contentType,
        ctt_s: Message.NULL,
        ctt_t: Message.NULL,
        data: media.data.toString('base64'),
        fn: Message.NULL,
        name: media.name,
        seq: seq++,
        text: Message.NULL
      });
    }

    const elements = [];
    const parts = [];
    for (const part of mediaParts) {
      parts.push({ part: [{ _attr: part }] });
    }

    if (parts.length > 0) {
      elements.push({ parts });
    }

    if (participants.length > 0) {
      elements.push({ addrs: participants });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attr: Record<string, any> = {
      address: this.participants
        .map(({ phoneNumber, name }) => {
          const displayPhoneNumber =
            mePhoneNumber === phoneNumber
              ? mePhoneNumber
              : `${this.prependPhoneNumbersInXml}${phoneNumber}${this.appendPhoneNumbersInXml}`;
          return name ? `${name} (${displayPhoneNumber})` : displayPhoneNumber;
        })
        .join('~'),
      ct_t: Message.MMS_CONTENT_TYPE,
      date: this.unixTime,
      m_type: mType,
      msg_box: msgBox,
      read: MessageReadStatus.Read,
      rr: Message.READ_REPORT,
      seen: 1,
      sub_id: 1,
      text_only: 1
    };

    return {
      mms: [
        {
          _attr: attr
        },
        ...elements
      ]
    };
  }
}
