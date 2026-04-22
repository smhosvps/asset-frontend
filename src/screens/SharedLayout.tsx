import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Menu, X, Settings, User, File, UserCircle, HouseIcon, AsteriskSquare, GitCompareArrows, LayoutDashboardIcon } from 'lucide-react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store/store'
import { useLogoutMutation } from '@/redux/api/apiSlice'
import { clearCredentials } from '@/redux/features/auth/authSlice'
import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface LayoutProps {
    children?: React.ReactNode
}

export default function SharedLayout({ children }: LayoutProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const [logout] = useLogoutMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    const navItems = [
        { icon: LayoutDashboardIcon, label: 'Dashboard', href: '/dashboard' },
        { icon: UserCircle, label: 'Accounts', href: '/dashboard/accounts' },
        { icon: HouseIcon, label: 'Properties', href: '/dashboard/properties' },
        { icon: File, label: 'Items', href: '/dashboard/manage-items' },
        { icon: AsteriskSquare, label: "Assets", href: "/dashboard/assets" },
        { icon: GitCompareArrows, label: "Requests", href: "/dashboard/requests" },
        { icon: Settings, label: 'Systems Settings', href: '/dashboard/settings' },
    ]

    const handleLogout = async () => {
        try {
            await logout({}).unwrap();
            dispatch(clearCredentials());
            // Navigate to sign-in page
            navigate("/");
            // Refresh the page
            window.location.reload();
        } catch (err) {
            console.error('Failed to log out:', err);
        }
    };

    useEffect(() => {
        // If there's no user, redirect to sign-in page
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-white w-64 fixed h-full transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static z-30`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold">SMHOS ASSET</h1>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <nav className="p-4 ">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link to={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start ${location.pathname === item.href ? 'bg-[#f4f5ff] text-[#5025d1]' : ''}`}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden ">
                <header className="bg-white shadow-sm">
                    <div className="max-w-8xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <h1 className="text-lg font-semibold text-gray-900">{navItems.find(item => item.href === location.pathname)?.label || 'Admin Panel'}</h1>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center">
                                        <span className="mr-2 hidden md:flex">{user?.user?.name}</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.user?.avatar?.url || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                                            <AvatarFallback>
                                                {user?.user?.avatar?.url ? <img src={user?.user?.avatar?.url} alt="User avatar" /> :
                                                    <User className="h-8 w-8" />
                                                }
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <Link to="/dashboard/settings">
                                        <DropdownMenuItem>
                                            Setting
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link to="/sign-in">
                                <Button variant="ghost">Login/Signup</Button>
                            </Link>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f5ff]">
                    <div className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8 ">
                        <Outlet />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

