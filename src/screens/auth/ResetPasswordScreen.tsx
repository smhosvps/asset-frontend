import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import { useReset_passwordMutation } from "@/redux/features/user/userApi"

export default function ResetPasswordScreen() {
  const [resetPassword, { isLoading }] = useReset_passwordMutation()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const location = useLocation()
  const navigate = useNavigate()
  const storedEmail = location.state?.email
  const [email, setEmail] = useState(storedEmail)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")


  useEffect(() => {
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      navigate("/forgot-password")
    }
  }, [navigate])

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {}
    if (!otp.trim()) {
      newErrors.otp = "OTP is required"
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits"
    }
    if (!newPassword) {
      newErrors.password = "Password is required"
    } else if (newPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInputs()) return
    try {
      const result = await resetPassword({ email, otp, newPassword }).unwrap()
      if (result?.success) {
        toast.success("Password reset successfully!")
        navigate("/sign-in")
      }
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to reset password. Please try again.")
      setErrors({ form: err.data?.message || "An error occurred. Please try again." })
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-8">Reset Password</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-2 rounded-md">
              <div className="space-y-2">
                <label htmlFor="otp" className="block font-medium">
                  OTP Code
                </label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter your OTP"
                  className={`w-full ${errors.otp ? 'border-red-500' : ''}`}
                />
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block font-medium">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className={`w-full ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
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
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>


            <div className="pt-4 text-gray-500">
              <p>All rights reserved.</p>
              <p>Copyright 2025 – SMHOS Asset Management™</p>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}