import React from 'react'
import Navbar from '../../organisms/landing/navbar'
import Link from 'next/link'
export const Section1 = () => {
    return (
        <React.Fragment>
            <div className="relative bg-white overflow-hidden">
                <div className=" mx-auto">
                    <div className="relative z-10">
                       

                        
                            <Navbar />
                        
                        <div class="md:flex md:-mx-4 md:mt-6 sm:mt-6 gradient text-white min-h-screen flex items-center">
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
                                        <a class="border border-white rounded p-4">Go Home</a>
                                    </Link>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
