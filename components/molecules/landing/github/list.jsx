import React from 'react'
import { BiCodeAlt } from "react-icons/bi";
export default function list(props) {
    return (
        <div className="relative">
        <dt>
          <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
           
          <BiCodeAlt/>
          </div>
          <p className="ml-16 text-lg leading-6 font-medium text-gray-900"><a href={props.data.html_url} target="_blank" rel="noopener noreferrer">{props.data.name}</a></p>
        </dt>
        <dd className="mt-0 ml-16 text-base text-gray-500">
         {props.data.language}
    </dd>
    <dd className="mt-2 ml-16 text-base text-gray-900">
         {props.data.description}
    </dd>
      </div>
    )
}
