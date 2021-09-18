import Head from 'next/head'
import { Section1 } from "../components/template/skill/section1"




export default function Home(props) {
    

    return (
        <>
            <Head>
                <title>Portofolio-Rangga</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <main>
                <Section1 />
            </main>
        </>
    )
}