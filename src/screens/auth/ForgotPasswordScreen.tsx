import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForgot_passwordMutation } from "@/redux/features/user/userApi"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("")
    const navigate = useNavigate()
    const [forgot_password, { isLoading }] = useForgot_passwordMutation()
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const validateInputs = () => {
        const newErrors: { [key: string]: string } = {}
        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateInputs()) return
        try {
            const result: any = await forgot_password({ email }).unwrap()
            if (result?.success) {
                navigate("/reset-password", { state: { email } })
            }
        } catch (err: any) {
            setErrors({ form: err.data.message })
        }
    }


    return (
        <>
            <div className="min-h-screen flex flex-col bg-gray-100">
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-semibold mb-8">Forgot password</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-2 rounded-md bg-white">

                            <div className="space-y-2">
                                <label htmlFor="username" className="block font-medium">
                                    Email
                                </label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    id="username"
                                    placeholder="Enter your email address"
                                    className="w-full"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {errors.form && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{errors.form}</span>
                                </div>
                            )}


                            <Button className="w-full bg-[#006CE4] hover:bg-[#005bbd]" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submiting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </Button>

                        </form>

                        <div className="space-y-4 text-center text-sm">
                            <div className="pt-4 text-gray-500">
                                <p>All rights reserved.</p>
                                <p>Copyright 2025 – SMHOS Asset Management™</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

        </>

    )
}