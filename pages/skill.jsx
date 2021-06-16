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
                                <h1 className="text-3xl md:text-4xl font-semibold mb-1 text-indigo-600">Experience</h1>

                            </div>
                        </div>

                            <div className="md:flex md:-mx-4 md:mt-12 md:mb-3 team-list">

                                <div className="md:w-1/3 md:px-4 mt-10 md:mt-0">
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
                                    </div>

                                    <div className="md:w-1/3 md:px-4 mt-10 md:mt-0">
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
                                        </div>

                                        <div className="md:w-1/3 md:px-4 mt-10 md:mt-0">
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
                                            </div>

                                        </div>

                                    </div>
                                </div>
              
            </main>
        </>
    )
}