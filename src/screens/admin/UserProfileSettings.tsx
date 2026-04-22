import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react'
import { useUpdateAvatarMutation, useUpdatePasswordMutation, useUpdateUserDataMutation } from '@/redux/features/user/userApi'
import { useGetUserQuery, useLogoutMutation } from '@/redux/api/apiSlice'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { clearCredentials } from '@/redux/features/auth/authSlice'
import { useNavigate } from 'react-router-dom'
import DeleteButton from '@/components/multiAction/DeleteButton'

type Props = {
  currentAvatarUrl?: string
}

export default function UserProfileSettings({ currentAvatarUrl }: Props) {
  const [updateUserData, { isLoading, isSuccess, error }] = useUpdateUserDataMutation()
  const [updateAvatar, { isLoading: loadingAvatar, isSuccess: successAvatar, error: errorAvatar }] = useUpdateAvatarMutation()
  const { data: user, refetch } = useGetUserQuery({});
  const [updatePassword, { data, isSuccess: success, error: errorUpdate, isLoading: loading }] = useUpdatePasswordMutation()
  const id = user?.user?._id
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logout, { isLoading: loadingLogout, isSuccess: successx }] = useLogoutMutation<any>();
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(user?.user?.name)
  const [email, setEmail] = useState(user?.user?.email)
  const [phoneNumber, setPhoneNumber] = useState(user?.user?.phoneNumber)
  const [role, setRole] = useState(user?.user?.role)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const imageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.readyState === 2) {
          const avatar = fileReader.result as string; // Convert to string
          updateAvatar(avatar); // Pass the string directly
        }
      };
      fileReader.readAsDataURL(file);
    }
  }


  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await updateUserData({
      phoneNumber,
      name,
      role
    }).unwrap()
  }
  useEffect(() => {
    if (successAvatar) {
      refetch()
      toast.success('Successfully updated your Profile Picture')
    }
    if (errorAvatar) {
      if ('data' in errorAvatar) {
        const errorData = errorAvatar as any
        toast.error(errorData.data.message)
      }
    }
    if (isSuccess) {
      refetch()
      toast.success('Successfully updated your Profile details')
    }
    if (error) {
      if ('data' in error) {
        const errorData = error as any
        toast.error(errorData.data.message)
      }
    }
    if (errorUpdate) {
      if ('data' in errorUpdate) {
        const errorData = errorUpdate as any
        toast.error(errorData.data.message)
      }
    }
    if (success) {
      const message = data?.message;
      toast.success(message);
      setIsOpen(true)
    }
    if (successx) {
      handleLogout()
      navigate('/')
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message)
      }
    }
  }, [isSuccess, error, loadingLogout, successx, errorUpdate, success, successAvatar, errorAvatar])


  const handleSubmitPassword = async (e: any) => {
    e.preventDefault();
    if (!newPassword) {
      return toast.error("Enter your new password")
    }
    if (!currentPassword) {
      return toast.error("Enter your current password")
    }

    await updatePassword({
      currentPassword,
      newPassword, id
    })
  }

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      dispatch(clearCredentials());
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };


  return (
    <div className="container mx-auto pt-4 pb-10 px-5 md:px-0">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 lg:h-30 w-24 lg:w-30">
                  <AvatarImage src={currentAvatarUrl || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                  <AvatarFallback>
                    {user?.user?.avatar?.url ? <img src={user?.user?.avatar?.url} /> :
                      <User className="h-24 lg:h-24 w-24 lg:w-24" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={imageHandler}
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
                  <Button variant="outline" onClick={handleButtonClick} disabled={loadingAvatar}>
                    {loadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Change picture"
                    )}
                  </Button>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <User className="mr-2 h-4 w-4 opacity-70" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e: any) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Mail className="mr-2 h-4 w-4 opacity-70" />
                      <Input
                        id="email"
                        type="email"
                        disabled
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Phone className="mr-2 h-4 w-4 opacity-70" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e: any) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  {user && user?.user?.role == "admin" &&
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={role}
                          onValueChange={setRole}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  }
                </div>
                <CardFooter>
                  <Button className='bg-green-700 hover:bg-green-800' type="submit">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>

          </Card>

        </TabsContent>
        <TabsContent value="account">
          <form onSubmit={handleSubmitPassword}>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account settings and set email preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current-password" className="text-right">
                    Current Password
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Lock className="mr-2 h-4 w-4 opacity-70" />
                    <Input id="current-password" type="password"
                      value={currentPassword}
                      onChange={(e: any) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-password" className="text-right">
                    New Password
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Lock className="mr-2 h-4 w-4 opacity-70" />
                    <Input id="new-password" type="password"
                      value={newPassword}
                      onChange={(e: any) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className='bg-green-700 hover:bg-green-900' type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
      {isOpen && (
        <DeleteButton setOpen={setIsOpen} open={open} action="Log out"
          text="Proceed to logout since you have successfully changed your password."
          handleDelete={handleLogout} loadingDelete={loading}
        />
      )}
    </div>
  )
}