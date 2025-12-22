import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className='w-[100svh] h-[100svh] flex justify-center items-center'><SignIn /></div>
}