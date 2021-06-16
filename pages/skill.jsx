import Head from 'next/head'
import { Section1 } from "../components/template/skill/section1"
import {Fragment} from "react"


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
                                <h1 className="text-3xl md:text-4xl font-semibold mb-1 text-indigo-600">Work Experience</h1>

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
                  
                                    <Fragment>
                                        <div className="md:flex md:-mx-4 mt-8 mb-9">
                                            <div className="md:w-10/12 xl:w-8/12 md:px-4 text-center md:mx-auto">
                                                <h1 className="text-3xl md:text-4xl font-semibold mb-1 text-indigo-600">Skill</h1>

                                            </div>
                                        </div>

                                        {/*indicator*/}
                                       

                        <div class="grid mt-4  gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-3">
                            <div class="flex flex-col">
                                <div class="bg-white shadow-2xl  rounded-3xl p-4 mx-10">
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
                                            <div class="w-14 h-full text-center text-xs text-white bg-purple-500 rounded-full">
                                            </div>
                                        </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                                <div class="flex-auto flex space-x-3">
                                                    <button class="mb-2 md:mb-0 bg-white px-5 py-2 shadow-sm tracking-wider border text-gray-600 rounded-full hover:bg-gray-100 inline-flex items-center space-x-2 ">
                                                        <span class="text-green-400 hover:text-green-500 rounded-lg">
                                                            <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="shopify" class="svg-inline--fa fa-shopify  w-5 h-5  " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                                <path fill="currentColor" d="M388.32,104.1a4.66,4.66,0,0,0-4.4-4c-2,0-37.23-.8-37.23-.8s-21.61-20.82-29.62-28.83V503.2L442.76,472S388.72,106.5,388.32,104.1ZM288.65,70.47a116.67,116.67,0,0,0-7.21-17.61C271,32.85,255.42,22,237,22a15,15,0,0,0-4,.4c-.4-.8-1.2-1.2-1.6-2C223.4,11.63,213,7.63,200.58,8c-24,.8-48,18-67.25,48.83-13.61,21.62-24,48.84-26.82,70.06-27.62,8.4-46.83,14.41-47.23,14.81-14,4.4-14.41,4.8-16,18-1.2,10-38,291.82-38,291.82L307.86,504V65.67a41.66,41.66,0,0,0-4.4.4S297.86,67.67,288.65,70.47ZM233.41,87.69c-16,4.8-33.63,10.4-50.84,15.61,4.8-18.82,14.41-37.63,25.62-50,4.4-4.4,10.41-9.61,17.21-12.81C232.21,54.86,233.81,74.48,233.41,87.69ZM200.58,24.44A27.49,27.49,0,0,1,215,28c-6.4,3.2-12.81,8.41-18.81,14.41-15.21,16.42-26.82,42-31.62,66.45-14.42,4.41-28.83,8.81-42,12.81C131.33,83.28,163.75,25.24,200.58,24.44ZM154.15,244.61c1.6,25.61,69.25,31.22,73.25,91.66,2.8,47.64-25.22,80.06-65.65,82.47-48.83,3.2-75.65-25.62-75.65-25.62l10.4-44s26.82,20.42,48.44,18.82c14-.8,19.22-12.41,18.81-20.42-2-33.62-57.24-31.62-60.84-86.86-3.2-46.44,27.22-93.27,94.47-97.68,26-1.6,39.23,4.81,39.23,4.81L221.4,225.39s-17.21-8-37.63-6.4C154.15,221,153.75,239.8,154.15,244.61ZM249.42,82.88c0-12-1.6-29.22-7.21-43.63,18.42,3.6,27.22,24,31.23,36.43Q262.63,78.68,249.42,82.88Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                        <span>62 Products</span>
                                                    </button>
                                                </div>
                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="bg-white shadow-2xl  rounded-3xl p-4 mx-10">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-48   lg:mb-0 mb-3">
                                            <img src="https://images.unsplash.com/photo-1622180203374-9524a54b734d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1950&amp;q=80" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Shop
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Massive Dynamic</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="flex py-4  text-sm text-gray-600">
                                                <div class="flex-1 inline-flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                                        </path>
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    <p class="">Cochin,KL</p>
                                                </div>
                                                <div class="flex-1 inline-flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    <p class="">05-25-2021</p>
                                                </div>
                                            </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                                <div class="flex-auto flex space-x-3">
                                                    <button class="mb-2 md:mb-0 bg-white px-5 py-2 shadow-sm tracking-wider border text-gray-600 rounded-full hover:bg-gray-100 inline-flex items-center space-x-2 ">
                                                        <span class="text-green-400 hover:text-green-500 rounded-lg">
                                                            <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="shopify" class="svg-inline--fa fa-shopify  w-5 h-5  " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                                <path fill="currentColor" d="M388.32,104.1a4.66,4.66,0,0,0-4.4-4c-2,0-37.23-.8-37.23-.8s-21.61-20.82-29.62-28.83V503.2L442.76,472S388.72,106.5,388.32,104.1ZM288.65,70.47a116.67,116.67,0,0,0-7.21-17.61C271,32.85,255.42,22,237,22a15,15,0,0,0-4,.4c-.4-.8-1.2-1.2-1.6-2C223.4,11.63,213,7.63,200.58,8c-24,.8-48,18-67.25,48.83-13.61,21.62-24,48.84-26.82,70.06-27.62,8.4-46.83,14.41-47.23,14.81-14,4.4-14.41,4.8-16,18-1.2,10-38,291.82-38,291.82L307.86,504V65.67a41.66,41.66,0,0,0-4.4.4S297.86,67.67,288.65,70.47ZM233.41,87.69c-16,4.8-33.63,10.4-50.84,15.61,4.8-18.82,14.41-37.63,25.62-50,4.4-4.4,10.41-9.61,17.21-12.81C232.21,54.86,233.81,74.48,233.41,87.69ZM200.58,24.44A27.49,27.49,0,0,1,215,28c-6.4,3.2-12.81,8.41-18.81,14.41-15.21,16.42-26.82,42-31.62,66.45-14.42,4.41-28.83,8.81-42,12.81C131.33,83.28,163.75,25.24,200.58,24.44ZM154.15,244.61c1.6,25.61,69.25,31.22,73.25,91.66,2.8,47.64-25.22,80.06-65.65,82.47-48.83,3.2-75.65-25.62-75.65-25.62l10.4-44s26.82,20.42,48.44,18.82c14-.8,19.22-12.41,18.81-20.42-2-33.62-57.24-31.62-60.84-86.86-3.2-46.44,27.22-93.27,94.47-97.68,26-1.6,39.23,4.81,39.23,4.81L221.4,225.39s-17.21-8-37.63-6.4C154.15,221,153.75,239.8,154.15,244.61ZM249.42,82.88c0-12-1.6-29.22-7.21-43.63,18.42,3.6,27.22,24,31.23,36.43Q262.63,78.68,249.42,82.88Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                        <span>62 Products</span>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="bg-white shadow-2xl  rounded-3xl p-4 mx-8">
                                    <div class="flex-none lg:flex">
                                        <div class=" h-full w-full lg:h-48 lg:w-48   lg:mb-0 mb-3">
                                            <img src="https://images.unsplash.com/photo-1622180203374-9524a54b734d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;ixlib=rb-1.2.1&amp;auto=format&amp;fit=crop&amp;w=1950&amp;q=80" alt="Just a flower" class=" w-full  object-scale-down lg:object-cover  lg:h-48 rounded-2xl" />
                                        </div>
                                        <div class="flex-auto ml-3 justify-evenly py-2">
                                            <div class="flex flex-wrap ">
                                                <div class="w-full flex-none text-xs text-blue-700 font-medium ">
                                                    Shop
                                                </div>
                                                <h2 class="flex-auto text-lg font-medium">Massive Dynamic</h2>
                                            </div>
                                            <p class="mt-3"></p>
                                            <div class="flex py-4  text-sm text-gray-600">
                                                <div class="flex-1 inline-flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                                        </path>
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    <p class="">Cochin,KL</p>
                                                </div>
                                                <div class="flex-1 inline-flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    <p class="">05-25-2021</p>
                                                </div>
                                            </div>
                                            <div class="flex p-4 pb-2 border-t border-gray-200 "></div>
                                            <div class="flex space-x-3 text-sm font-medium">
                                                <div class="flex-auto flex space-x-3">
                                                    <button class="mb-2 md:mb-0 bg-white px-5 py-2 shadow-sm tracking-wider border text-gray-600 rounded-full hover:bg-gray-100 inline-flex items-center space-x-2 ">
                                                        <span class="text-green-400 hover:text-green-500 rounded-lg">
                                                            <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="shopify" class="svg-inline--fa fa-shopify  w-5 h-5  " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                                <path fill="currentColor" d="M388.32,104.1a4.66,4.66,0,0,0-4.4-4c-2,0-37.23-.8-37.23-.8s-21.61-20.82-29.62-28.83V503.2L442.76,472S388.72,106.5,388.32,104.1ZM288.65,70.47a116.67,116.67,0,0,0-7.21-17.61C271,32.85,255.42,22,237,22a15,15,0,0,0-4,.4c-.4-.8-1.2-1.2-1.6-2C223.4,11.63,213,7.63,200.58,8c-24,.8-48,18-67.25,48.83-13.61,21.62-24,48.84-26.82,70.06-27.62,8.4-46.83,14.41-47.23,14.81-14,4.4-14.41,4.8-16,18-1.2,10-38,291.82-38,291.82L307.86,504V65.67a41.66,41.66,0,0,0-4.4.4S297.86,67.67,288.65,70.47ZM233.41,87.69c-16,4.8-33.63,10.4-50.84,15.61,4.8-18.82,14.41-37.63,25.62-50,4.4-4.4,10.41-9.61,17.21-12.81C232.21,54.86,233.81,74.48,233.41,87.69ZM200.58,24.44A27.49,27.49,0,0,1,215,28c-6.4,3.2-12.81,8.41-18.81,14.41-15.21,16.42-26.82,42-31.62,66.45-14.42,4.41-28.83,8.81-42,12.81C131.33,83.28,163.75,25.24,200.58,24.44ZM154.15,244.61c1.6,25.61,69.25,31.22,73.25,91.66,2.8,47.64-25.22,80.06-65.65,82.47-48.83,3.2-75.65-25.62-75.65-25.62l10.4-44s26.82,20.42,48.44,18.82c14-.8,19.22-12.41,18.81-20.42-2-33.62-57.24-31.62-60.84-86.86-3.2-46.44,27.22-93.27,94.47-97.68,26-1.6,39.23,4.81,39.23,4.81L221.4,225.39s-17.21-8-37.63-6.4C154.15,221,153.75,239.8,154.15,244.61ZM249.42,82.88c0-12-1.6-29.22-7.21-43.63,18.42,3.6,27.22,24,31.23,36.43Q262.63,78.68,249.42,82.88Z">
                                                                </path>
                                                            </svg>
                                                        </span>
                                                        <span>62 Products</span>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                                    </Fragment>
                                    
                                </div>


              
            </main>
        </>
    )
}