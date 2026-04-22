import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/redux/features/user/userApi";

// Password strength validation regex
const PHONE_REGEX = /^\+?\d{7,15}$/; // International phone number format

export default function RegisterAsGuestScreen() {
  const [register, { isLoading }] = useRegisterMutation<any>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateInputs = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    if (formData.phoneNumber && !PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const result = await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        role: "user"
      }).unwrap();

      if (result?.success) {
        navigate("/otp-verification", { 
          state: { email: formData.email },
          replace: true // Prevent back navigation
        });
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Registration failed. Please try again.";
      setErrors({
        form: errorMessage === "User already exists" 
          ? "Account already exists. Please sign in."
          : errorMessage
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user types
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-8">Register as User</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-2">
            {/* Name and Email Inputs */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">
                  Name
                </label>
                <Input
                  value={formData.name}
                  type="text"
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  id="name"
                  placeholder="Enter your name"
                  minLength={2}
                  className={`w-full ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  id="email"
                  placeholder="Enter your email"
                  autoComplete="username"
                  className={`w-full ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            {/* Phone and Address Inputs */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block font-medium">
                  Phone
                </label>
                <Input
                  value={formData.phoneNumber}
                  type="tel"
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  id="phoneNumber"
                  placeholder="+2348000000000"
                  pattern="\+?\d{7,15}"
                  className={`w-full ${errors.phoneNumber ? "border-red-500" : ""}`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="block font-medium">
                  Address
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  id="address"
                  placeholder="Enter your address"
                  className={`w-full ${errors.address ? "border-red-500" : ""}`}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                id="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                minLength={8}
                className={`w-full ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Error Message */}
            {errors.form && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded relative" role="alert" aria-live="polite">
                {errors.form}
              </div>
            )}

            <Button 
              className="w-full bg-[#006CE4] hover:bg-[#005bbd]" 
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          {/* Existing login link and footer */}
        </div>
      </main>
    </div>
  );
}