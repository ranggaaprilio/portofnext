import Head from 'next/head'
import Link from 'next/link'


//Landing Page Template Section
import {Section1} from "../components/template/404/section1"


export default function Home(props) {
  return (
    <>
    <Head>
        <title>Portofolio-Rangga</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    {/* Header*/}
     <Section1/>
     <div class="gradient text-white min-h-screen flex items-center">
  <div class="container mx-auto p-4 flex flex-wrap items-center">
    <div class="w-full md:w-5/12 text-center p-4">
      <img src="https://themichailov.com/img/not-found.svg" alt="Not Found" />
    </div>
    <div class="w-full md:w-7/12 text-center md:text-left p-4">
      <div class="text-6xl font-medium">404</div>
      <div class="text-xl md:text-3xl font-medium mb-4">
        Oops. This page has gone missing.
      </div>
      <div class="text-lg mb-8">
        Maybe this page is still under maintenance.
      </div>
      <Link href="/">
      <a  class="border border-white rounded p-4">Go Home</a>
      </Link>
      
    </div>
  </div>
</div>
    </>
  )
}





