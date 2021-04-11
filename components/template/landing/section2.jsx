import React from 'react'

import About from "../../organisms/landing/about";
import Github from "../../organisms/landing/github";
export const Section2=(props)=> {
    return (
        <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <About/>
        <Github github={props.github}/>
      </div>
    </div>
    )
}
