export const STYLE = `<style type="text/css" id="custom-style">
  body {
    font-size: 13px;
    font-family: Arial, Helvectica, sans-serif;
  }

  hr {
    margin: 10px auto;
    width: 750px;
    min-width: 750px;
    border-top: 5px solid;
  }

  a {
    color: #00c;
  }

  a:hover {
    text-decoration: underline;
  }

  .tags,
  .hChatLog,
  .noteContainer,
  .deletedStatusContainer {
    margin: 0 auto;
    width: 750px;
    min-width: 750px;
  }

  .message {
    max-width: 640px;
  }

  cite {
    font-style: normal;
  }

  q::before {
    content: '';
  }

  q::after {
    content: '';
  }

  .tags,
  .noteContainer {
    margin-top: 13px;
  }

  .participants {
    margin-bottom: 13px;
  }

  .deletedStatusContainer {
    margin-bottom: 13px;
  }

  .haudio {
    margin: 0 auto;
    width: 750px;
    min-width: 750px;
  }

  .album {
    display: block;
    font-size: 110%;
    line-height: 200%;
  }

  .haudio > .fn {
    display: none;
  }

  .contributor {
    font-size: 110%;
    font-weight: bold;
  }

  .published {
    display: block;
  }

  .tags,
  .noteContainer {
    margin-top: 13px;
  }

  audio {
    display: block;
  }

  .start-time,
  .end-time,
  .confidence {
    display: none;
  }

  .high {
    color: #000;
  }

  .med {
    color: #555;
  }

  .low {
    color: #888;
  }

  .full-text {
    display: none;
  }
</style>
`;
