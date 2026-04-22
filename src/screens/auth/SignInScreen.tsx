import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLoginMutation } from "@/redux/api/apiSlice";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom"

// Security configurations
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const PASSWORD_MIN_LENGTH = 8;

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error: ServerError }] = useLoginMutation<any>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [lockout, setLockout] = useState(false);

    // Lockout timer
    useEffect(() => {
        if (lockout) {
            const timer = setTimeout(() => {
                setLockout(false);
                setAttempts(0);
            }, LOCKOUT_DURATION);
            return () => clearTimeout(timer);
        }
    }, [lockout]);

    // Input validation
    const validateInputs = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (password.length < PASSWORD_MIN_LENGTH) {
            setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Security checks
        if (lockout) {
            setError('Too many failed attempts. Please try again later.');
            return;
        }

        if (!validateInputs()) return;

        try {
            const userData = await login({ email, password }).unwrap();
            
            // Secure credential storage
            // dispatch(setCredentials({
            //     ...userData,
            //     token: undefined // Prefer httpOnly cookies for token storage
            // }));
            dispatch(setCredentials(userData));
            // Reset attempts on success
            setAttempts(0);
            navigate("/dashboard");
        } catch (err) {
            // Security: Generic error messages
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setLockout(true);
                setError('Account temporarily locked due to multiple failed attempts');
                return;
            }

            if (ServerError?.data?.message === "Account not verified") {
                navigate("/otp-verification", { state: { email } })
            } else {
                setError(ServerError?.data?.message);
            }

            // Security: Add artificial delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold mb-2">Sign In</h1>
                        <h1 className="text-lg font-medium mb-8 text-red-700">Admin or User</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-2 rounded-md">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full"
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="block font-medium">
                                Password
                            </label>
                            <Input
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                placeholder="Enter your password"
                                className="w-full"
                                autoComplete="current-password"
                                minLength={PASSWORD_MIN_LENGTH}
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button 
                            className="w-full bg-[#006CE4] hover:bg-[#005bbd]" 
                            disabled={isLoading || lockout}
                            type="submit"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                            <a href="/forgot-password" className="text-[#006CE4] hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        <div className="space-y-4 text-center text-sm">

                            <div className="my-3" />
                            <Link className="mt-3" to="/register">
                                <Button
                                    variant="outline"
                                    className="w-full border-[#006CE4] text-[#006CE4] hover:bg-[#006CE4] hover:text-white"
                                >
                                    Create account
                                </Button>
                            </Link>

                            <div className="my-3" />

                            <div className="pt-4 text-gray-500">
                                <p>All rights reserved.</p>
                                <p>Copyright 2025 – SMHOS Asset Management™</p>
                            </div>
                        </div>
                </div>
            </main>
        </div>
    )
}