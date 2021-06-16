import React from 'react'
import Logo from '../../molecules/landing/navbar/logo'
import List from '../../atoms/navbar/list'

const navbar = () => {
    return (
        <React.Fragment>
             <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start" aria-label="Global">
               <Logo/>
                  <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
                  <List title="Introduction" linkhref="/"/>
                  <List title="Skill" linkhref="/skill"/>
                    {/* <List title="Blog"/> */}
                  <List title="Contact" linkhref="/contact"/>
                  <List title="Portofolio"  linkhref="/portofolio" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"/>
                  </div>
                </nav>
        </React.Fragment>
    )
}

export default navbar
