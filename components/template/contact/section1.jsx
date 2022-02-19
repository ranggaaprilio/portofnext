import React, { useState } from 'react'
import { motion } from "framer-motion";
import Navbar from '../../organisms/landing/navbar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const Section1 = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {

    if (!firstName || !lastName || !email || !message) {
      alert("Please fill all the form")
      return false
    }

    console.log('Sending')
    let data = {
      firstName,
      lastName,
      email,
      message
    }

    fetch('/api/sendMail', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then((res) => {
      console.log('Response received')
      if (res.status === 200) {
        console.log('Response succeeded!')
        toast("Thank you for your message, I will get back to you soon!");
        setFirstName('')
        setLastName('')
        setEmail('')
        setMessage('')
      }
    }).catch(err => {
      console.log('error', err)
      toast.error("Opps..we get some Error,Please Try Agein !");
      setFirstName('')
      setLastName('')
      setEmail('')
      setMessage('')
    })
  }

  return (
    <React.Fragment>
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-10 lg:max-w-2xl lg:w-full lg:pb-10 xl:pb-10">
            <React.Fragment>
              <Navbar />
            </React.Fragment>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4  ">
            <div class="p-4  bg-white ">
              <div class="block mb-4 ">
                <h1 class="text-4xl font-bold leading-none text-gray-900 dark:text-white mb-2">Get In <span className='text-indigo-600'>Touch</span></h1>
                <p className='block'>Let's Talk about something fun!!</p>
              </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4  ">
             <div>
                <a href="#" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" >
                  <div className='p-6 flex'>
                    <img src="/images/sosmed/email.png" alt="email" style={{height:'80px',width:'80px'}} className="m-0" srcset=""  className='rounded-lg' />
                    <p className='text-center mx-auto pt-6'>rangga@devapril.com</p>
                  </div>
                </a>
              </div>
              <div>
                <a href="https://twitter.com/ranggaaprillio" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" >
                  <div className='p-6 flex'>
                    <img src="/images/sosmed/twitter.png" alt="email" style={{height:'80px',width:'80px'}} className="m-0" srcset=""  className='rounded-lg' />
                    <p className='text-center mx-auto pt-6'>ranggaaprillio</p>
                  </div>
                </a>
              </div>
              <div>
                <a href="https://www.facebook.com/aprillioutama" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" >
                  <div className='p-6 flex'>
                    <img src="/images/sosmed/facebook.png" alt="email" style={{height:'80px',width:'80px'}} className="m-0" srcset=""  className='rounded-lg' />
                    <p className='text-center mx-auto pt-6'>rangga aprilio utama</p>
                  </div>
                </a>
              </div>
              <div>
                <a href="https://github.com/ranggaaprilio" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" >
                  <div className='p-6 flex'>
                    <img src="/images/sosmed/github.png" alt="email" style={{height:'80px',width:'80px'}} className="m-0" srcset=""  className='rounded-lg' />
                    <p className='text-center mx-auto pt-6'>ranggaaprilio</p>
                  </div>
                </a>
              </div>
              <div>
                <a href="https://www.instagram.com/ranggaaprilio/" class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700" >
                  <div className='p-6 flex'>
                    <img src="/images/sosmed/instagram.png" alt="email" style={{height:'80px',width:'80px'}} className="m-0" srcset=""  className='rounded-lg' />
                    <p className='text-center mx-auto pt-6'>ranggaaprilio</p>
                  </div>
                </a>
              </div>
             </div>
            </div>
            <div className='container mx-auto p-8'>
              <form class="w-full max-w-lg">
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                      First Name
                    </label>
                    <input class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Jane" onChange={(e) => setFirstName(e.target.value)} value={firstName} />
                    {/* <p class="text-red-500 text-xs italic">Please fill out this field.</p> */}
                  </div>
                  <div class="w-full md:w-1/2 px-3">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-last-name">
                      Last Name
                    </label>
                    <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="Doe" onChange={(e) => setLastName(e.target.value)} value={lastName} />
                  </div>
                </div>
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full px-3">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-email">
                      E-mail
                    </label>
                    <input class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    {/* <p class="text-gray-600 text-xs italic">Some tips - as long as needed</p> */}
                  </div>
                </div>
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full px-3">
                    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-msg">
                      Message
                    </label>
                    <textarea class=" no-resize appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-48 resize-none" id="message" onChange={(e) => setMessage(e.target.value)} value={message}></textarea>
                    {/* <p class="text-gray-600 text-xs italic">Re-size can be disabled by set by resize-none / resize-y / resize-x / resize</p> */}
                  </div>
                </div>
                <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleSubmit}>Send</button>
              </form>
            </div>

          </div>

        </div>
      </div>
      <ToastContainer />
    </React.Fragment>
  )
}