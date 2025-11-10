import Loading from '@/Components/loading'
import VerifyOtp from '@/Components/verify'
import React, { Suspense } from 'react'

const VerifyPage = () => {
  return (
    <Suspense fallback={<Loading />}>
        <VerifyOtp/>
    </Suspense>
  )
}

export default VerifyPage