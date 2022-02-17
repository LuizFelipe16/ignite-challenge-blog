import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />

          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap"
            rel="stylesheet"
          />

          <link rel="shortcut icon" href="/Logo.svg" type="image/svg" />

          {/* <script async defer src={`//static.cdn.prismic.io/prismic.js?repo=myblogs&new=true`} /> */}

          <script async defer src="https://static.cdn.prismic.io/prismic.js?new=true&repo=myblogs"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}