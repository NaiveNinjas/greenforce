import '@carbon/styles/css/styles.css';
import '../styles/global.scss';
import { Theme, Content } from '@carbon/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme theme="g100">
      <Content style={{ padding: '2rem', height: '100%', overflowY: 'scroll' }}>
        <Component {...pageProps} />
      </Content>
    </Theme>
  );
}
