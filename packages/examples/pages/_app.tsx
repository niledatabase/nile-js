import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {NileProvider} from '@theniledev/react'

function MyApp({ Component, pageProps }: AppProps) {
  return <NileProvider apiUrl="http://net-lb-syeda-49a2339-1223006815.us-west-2.elb.amazonaws.com:8080"><Component {...pageProps} /></NileProvider>
}

export default MyApp
