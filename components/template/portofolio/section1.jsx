import React, {useEffect} from 'react'
import Navbar from '../../organisms/landing/navbar'
var axios = require("axios").default;
import Zoom from 'react-reveal/Zoom';
import Image from 'next/image'


export const Section1 = () => {
    return (
        <React.Fragment>
          <div className="relative bg-white overflow-hidden">
                <div className=" mx-auto">
                    <div className="relative z-10 ">
                            <Navbar />
                        <div className="flex  md:mt-6 md:mb-3 h-48 w-screen bg-indigo-700 items-center ">
                            <h1 className="md:text-4xl sm:text-sm font-size-1 mt-2 ml-10 text-white">Life Hasn't CTRL+Z</h1>
                        </div>
                        <div className="mx-8 md:container">
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className=" sm:mx-2 md:mr-10 w-auto h-3/4">
                                        <Image src="/images/porto/niu.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className=" w-auto">
                                        <h1 className="text-lg font-bold mt-8">NIU Digital CRM</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>
                                </div>
                            </Zoom>
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className="  w-auto h-3/4  md:order-2 ">
                                    <Image src="/images/porto/devcon.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className="sm:mx-2 w-auto  md:order-1  ">
                                        <h1 className="text-lg font-bold mt-8">Konekin Dev</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>

                                </div>
                            </Zoom>
                           <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className=" sm:mx-2 md:mr-10 w-auto h-3/4 ">
                                    <Image src="/images/porto/Bikincv.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className=" w-auto">
                                        <h1 className="text-lg font-bold mt-8">BikinCVmu!</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>
                                </div>
                           </Zoom>
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className="  w-auto h-3/4  md:order-2 ">
                                    <Image src="/images/porto/Quran.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className="sm:mx-2 w-auto  md:order-1  ">
                                        <h1 className="text-lg font-bold mt-8">Qur'an App</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>

                                </div>
                            </Zoom>
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className=" sm:mx-2 md:mr-10 w-auto h-3/4">
                                    <Image src="/images/porto/BNI.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className=" w-auto">
                                        <h1 className="text-lg font-bold mt-8">BNI Telemarketing</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>
                                </div>
                            </Zoom>
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className=" w-auto h-3/4  md:order-2 ">
                                    <Image src="/images/porto/cdd.PNG" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className="sm:mx-2 w-auto  md:order-1  ">
                                        <h1 className="text-lg font-bold mt-8">HSBC Telesales</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>

                                </div>
                            </Zoom>
                            <Zoom>
                                <div className="md:flex justify-between mt-5 mb-5">
                                    <div className=" sm:mx-2 md:mr-10 w-auto h-3/4">
                                    <Image src="/images/porto/carrer.png" alt="niu" srcset="" className="rounded-xl" width="1000px" height="500px" />
                                    </div>
                                    <div className=" w-auto">
                                        <h1 className="text-lg font-bold mt-8">Carrer Aseanindo</h1>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex veniam aliquid possimus molestiae ducimus fugiat, libero nihil inventore magni vitae molestias omnis commodi dignissimos cumque voluptatum accusantium tempore, quis quod.</p>
                                    </div>
                                </div>
                            </Zoom>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
