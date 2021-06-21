import React from 'react'
import { BsLayersFill } from "react-icons/bs";
import List from '../../molecules/landing/github/list'

 function github(props) {
   const {allPosts}=props.github
  //  console.log(allPosts.data.length);
    return (
        <div className="mt-10">
          <div className="lg:text-center mb-7">
          <h2 className="  text-xl text-indigo-600 font-semibold tracking-wide uppercase ">Sample of Github Project</h2>
          </div> 
        <dl className="space-y-11 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          {allPosts.success==true?allPosts.data.map((v,i)=>(
             <List key={v.id} data={v}/>
          )):null}
        </dl>
      </div>
    )
}



  export default github;


