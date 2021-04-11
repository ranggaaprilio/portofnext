import React from 'react'

function list(props) {
    return (
        <React.Fragment>
             <a href="#" className={props.class!=null?props.class:"font-medium text-gray-500 hover:text-gray-900"}>{props.title}</a>
        </React.Fragment>
    )
}

export default list
