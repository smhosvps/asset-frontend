import loader from "../../assets/loader.json";
import Lottie from "lottie-react";


const Loader = () => {

    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 z-50"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  p-8 rounded  z-50">
                <Lottie animationData={loader} loop={true} className='h-[200px]' />
            </div>
        </>
    )
}

export default Loader