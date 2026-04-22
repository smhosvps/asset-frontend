import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
    open: any;
    setOpen: any;
    handleDelete: any
    action: string;
    loadingDelete: any;
    text: any
}

export default function DeleteButton({ open, setOpen, handleDelete, action, text, loadingDelete }: Props) {
    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 z-50"></div>

            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 md:p-5 lg:p-8  rounded shadow-lg z-50 w-[90%] md:w-[40%] lg:w-[30%] overflow-y-auto">
                <div className="flex justify-between flex-col items-center mb-4">
                    <h1 className="text-xl font-semibold text-center my-8">
                        {text}
                    </h1>
                    <div className='flex w-full items-center justify-around mb-6 mt-3'>
                        <Button variant="destructive"
                            onClick={handleDelete}
                        >
                            {loadingDelete ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                <>
                                    {action}
                                </>
                            )}

                        </Button>
                        <Button variant="secondary"
                            onClick={() => setOpen(!open)}
                        >
                            Cancel
                        </Button>

                    </div>

                </div>
            </div>
        </>
    )
}