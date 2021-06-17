import React from 'react'
import Navbar from '../../organisms/landing/navbar'
export const Section1 = () => {
    return (
        <React.Fragment>
          <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-6 md:pb-6 lg:max-w-2xl lg:w-full lg:pb-6 xl:pb-6">
                            <Navbar />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
