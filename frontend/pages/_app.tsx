import '@carbon/styles/css/styles.css';
import '../styles/global.scss';
import { Theme, Content } from '@carbon/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme theme="g100">
      <Head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </Head>
      <Content style={{ padding: '2rem', height: '100%', overflowY: 'scroll' }}>
        <Component {...pageProps} />
      </Content>
    </Theme>
  );
}
