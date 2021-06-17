import Head from 'next/head'
import {Section1} from "../components/template/portofolio/section1"
import { Fragment } from "react";


export default function Portofolio() {
    return (
        <>
            <Head>
                <title>Portofolio-Rangga</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
           <main>
            <Section1/>
            
            <div className="h-48 w-screen bg-indigo-700">

            </div>
                  
                                  
                                    
            
           </main>
          

        </>
    )
}