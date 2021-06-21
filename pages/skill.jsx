import Head from 'next/head'
import { Section1 } from "../components/template/skill/section1"
import {Fragment,useEffect} from "react"
import {motion,useViewportScroll, useTransform}from"framer-motion"



export default function Home(props) {
    const { scrollYProgress } = useViewportScroll();
    const scale = useTransform(scrollYProgress, [0, 2], [0.5, 2]);

    useEffect(()=>{
        console.log(scrollYProgress,'val');
        
    },[scrollYProgress])
    
    return (
        <>
            <Head>
                <title>Portofolio-Rangga</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
           
            <main>
                <Section1/>
              
                <div className="team-1 py-4 md:py-12 bg-white">
                        <div className="container mx-auto px-4">

                            <div className="md:flex md:-mx-4">
                                <div className="md:w-10/12 xl:w-8/12 md:px-4 text-center md:mx-auto">
                                <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-indigo-600">Profile</h1>
                                <h6 className="text-2xl font-medium  mb-4 text-gray-700">I'm a Full Stack Developer ,from Bogor, Indonesia. I Solve the problem with a logical thinking and my creative solution</h6>
                                <p className="text-xl text-gray-900 text-justify">Experienced Web Developer adept in all stages of advanced web development. Knowledgeable in user interface, testing, and debugging processes. Bringing forth expertise in design, installation, testing and maintenance of web systems. Equipped with a diverse and promising skill-set. Proficient in an assortment of technologies, including HTML,CSS,Javascript,PHP, and Microsoft SQL Server,MySQL,. Able to effectively self-manage during independent projects, as well as collaborate in a team setting.</p>
                                    
                                </div>
                            </div>

                        <div className="md:flex md:-mx-4 mt-5">
                            <div className="md:w-10/12 xl:w-8/12 md:px-4 text-center md:mx-auto">
                                <h1 className="text-3xl md:text-4xl font-semibold mb-1 text-indigo-600">Work Experience</h1>

                            </div>
                        </div>

                            <div className="md:flex md:-mx-4 md:mt-12 md:mb-3 team-list">

                                <motion.div className="md:w-1/3 md:px-4 mt-10 md:mt-0"  style={{ scale}}>
                                <div className="bg-white border border-solid max-w-sm mx-auto team-profile shadow-md">
                                    <div className="px-5 py-12 flex flex-col items-center">
                                        <div className="hidden lg:block lg:w-1/2 bg-cover">
                                            <img src="//aseanindo.com/image/logo/aseanindo.png" alt="aseanindo" className="  w-full  lg:object-contain  lg:h-48 rounded-2xl" />
                            </div>
                                             <h5 className="mt-4 mb-1 text-xl font-medium">Full Stack Developer</h5>
                                                <span className="text-sm text-gray-500 font-medium uppercase">Pt Aseanindo Kapita Solusi</span>
                                            </div>
                                            <div className="flex border-t border-solid divide-x">
                                                <a href="#" className="text-base text-gray-600 text-center py-3 flex-grow hover:text-blue-700 transition-colors duration-300">
                                                    <span className="fab fa-linkedin-in"> 2019 - present</span>
                                                </a>
                                               
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div className="md:w-1/3 md:px-4 mt-10 md:mt-0"  style={{ scale}}>
                                <div className="bg-blue-800 border border-solid max-w-sm mx-auto team-profile shadow-md">
                                    <div className="px-5 py-12 flex flex-col items-center">
                                        <div className="hidden lg:block lg:w-1/2 bg-cover">
                                            <img src="https://staticxl.ext.xlaxiata.co.id/s3fs-public/logo.png" alt="Nelson Hunter" className=" w-full  md:object-contain  lg:h-48 rounded-2xl"/>
                            </div>
                                        <h5 className="mt-4 mb-1 text-xl font-medium text-white">Internship as IT Support</h5>
                                        <span className="text-sm text-gray-100 font-medium uppercase">PT XL Axiata Tbk</span>
                                                </div>
                                                <div className="flex border-t border-solid divide-x">
                                        <a href="#" className="text-base text-gray-100 text-center py-3 flex-grow hover:text-blue-700 transition-colors duration-300">
                                                        <span className="fab fa-linkedin-in"> 01 August 2018 - 18 September 2018</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div className="md:w-1/3 md:px-4 mt-10 md:mt-0"  style={{ scale}}>
                                <div className="bg-white border border-solid max-w-sm mx-auto team-profile shadow-md">
                                    <div className="px-5 py-12 flex flex-col items-center">
                                        <div className="hidden lg:block lg:w-1/2 bg-cover">
                                            <img src="https://pbs.twimg.com/profile_images/1041102297844015104/WU_EsLK4_400x400.jpg" className=" w-full  md:object-contain  lg:h-48 rounded-2xl"/>
                            </div>
                                                     <h5 className="mt-4 mb-1 text-xl font-medium">Lecturer assistant</h5>
                                                        <span className="text-sm text-gray-500 font-medium uppercase">Universitas Bina Sarana Informatika</span>
                                                    </div>
                                                    <div className="flex border-t border-solid divide-x">
                                                        <a href="#" className="text-base text-gray-600 text-center py-3 flex-grow hover:text-blue-700 transition-colors duration-300">
                                                        <span className="fab fa-linkedin-in"> 2018 - 2019</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>

                                        </div>

                                    </div>
                  
                                    <Fragment>
                                        <div className="md:flex md:-mx-4 mt-8 mb-9">
                                            <div className="md:w-10/12 xl:w-8/12 md:px-4 text-center md:mx-auto">
                                                <h1 className="text-3xl md:text-4xl font-semibold mb-1 text-indigo-600">Skill</h1>

                                            </div>
                                        </div>

                                        {/*indicator*/}
                                       

                        <div class="grid mt-4  gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-3">
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                                <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10 ">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-48   lg:mb-0 mb-3">
                                            <img src="https://nextgen.co.id/wp-content/uploads/2020/12/javascript.jpg.webp" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Programing Language
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Javascript</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-36 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col"  whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-48   lg:mb-0 mb-3">
                                            <img src="https://husniadil.com/static/f077206b8d4cb72af2eba0ca51948aa5/7330c/golang-square.webp" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Programing Language
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Golang</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-28 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-48   lg:mb-0 mb-3">
                                            <img src="https://static.cdn-cdpl.com/source/b9a5514dc9fc5b70ff85311558a3cd27/PHP.png" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Programing Language
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">PHP</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-24 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="https://skspace.sgp1.cdn.digitaloceanspaces.com/webAssets/track-cover/reactjs.jpg" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Framework
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">React Js</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-28 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="https://buddy.works/guides/covers/test-nodejs-app/share-nodejs-logo.png" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Framework
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Node Js</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-32 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="https://images.ctfassets.net/23aumh6u8s0i/c04wENP3FnbevwdWzrePs/1e2739fa6d0aa5192cf89599e009da4e/nextjs" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Framework
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Next Js</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-24 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="https://pbs.twimg.com/profile_images/1273307847103635465/lfVWBmiW_400x400.png" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Tools
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Docker</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-24 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="http://www.w3school.in/wp-content/uploads/2016/11/mysql_hosting.png" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Database
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Mysql</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-32 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div class="flex flex-col" whileHover={{ scale: 1.1, rotate: [0,-10,10,0] }}
                                        whileTap={{
                                            scale: 0.8,
                                         }}>
                            <div class="bg-white shadow-xl  rounded-3xl p-4 mx-10  hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-40   lg:mb-0 mb-3">
                                            <img src="https://static.cdn-cdpl.com/source/ccf15cfcef568a0f548de6dd42022aaf/cp-ms-sql.png" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Database
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">MS SQL Server</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="w-full h-2 bg-gray-200 rounded-full mt-2">
                                            <div class="w-32 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                              
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        
                                    </Fragment>
                                    
                                </div>


              
            </main>
        </>
    )
}