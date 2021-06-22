import Head from 'next/head'



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
    
    </>
  )
}





