import React from 'react'
import Navbar from '../../organisms/landing/navbar'
export const Section1 = () => {
    return (
        <React.Fragment>
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-6 md:pb-6 lg:max-w-2xl lg:w-full lg:pb-6 xl:pb-6">
                        <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                       
                            <Navbar />
                        
                      


                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
