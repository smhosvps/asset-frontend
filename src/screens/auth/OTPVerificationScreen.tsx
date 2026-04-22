import { useState, useRef, KeyboardEvent, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActivationMutation, useResendOtpMutation } from "@/redux/features/user/userApi"
import { toast } from "react-toastify"

export default function OTPVerificationScreen() {
  const [activation, { isLoading: isActivationLoading }] = useActivationMutation()
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const location = useLocation()
  const navigate = useNavigate()
  const storedEmail = location.state?.email
  const [email, setEmail] = useState(storedEmail)
  const [countdown, setCountdown] = useState(60)
  const [error, setError] = useState("")


  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    if (!storedEmail) {
      navigate("/sign-in")
    } else {
      setEmail(storedEmail)
    }
  }, [navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value !== "" && index < 5) {
        inputRefs[index + 1].current?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }
    setError("")
    try {
      const result = await activation({ otp: otpString, email }).unwrap()
      if (result?.success) {
        toast.success("Account verified successfully!")
        navigate("/sign-in")
      }
    } catch (err:any) {
      setError(err?.data?.message)
      toast.error("Verification failed. Please try again.")
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    try {
      await resendOtp({ email }).unwrap()
      setCountdown(60)
      toast.success("OTP resent successfully!")
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
      toast.error("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100 ">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-8">OTP Verification</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-2 rounded-md bg-white">
              <div className="space-y-2">
                <label htmlFor="otp-input" className="block font-medium">
                  Enter OTP Code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-[#006CE4] hover:bg-[#005bbd]"
                disabled={isActivationLoading}
              >
                {isActivationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResendLoading}
                  className="p-0 h-auto text-[#006CE4] hover:underline cursor-pointer"
                >
                  {isResendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </p>
            </div>

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