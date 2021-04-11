import Head from 'next/head'
import {githublist} from "../helper/api";

//Landing Page Template Section
import {Section1} from "../components/template/landing/section1"
import {Section2} from "../components/template/landing/section2"

export default function Home(props) {
  return (
    <>
    <Head>
        <title>Portofolio-Rangga</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    {/* Header*/}
     <Section1/>
    {/* About */}
     <Section2 github={props.list}/>
    </>
  )
}

export async function getStaticProps() {
  
  const allPosts = await githublist();
  return {
    props: {
      list: {allPosts},
    },
  };
}