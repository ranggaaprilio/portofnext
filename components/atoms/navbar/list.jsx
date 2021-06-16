import React from 'react'
import Link from 'next/link'
 
function list({ title, className, linkhref}) {
    return (
        <React.Fragment>
            <Link href={linkhref}>
             <a className={className != null ? className:"font-medium text-gray-500 hover:text-gray-900"}>{title}</a>
            </Link>
        </React.Fragment>
    )
}

export default list
