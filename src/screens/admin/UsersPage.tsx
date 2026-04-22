import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDeleteUserMutation, useGetAllUsersQuery } from "@/redux/features/user/userApi"
import Loader from "@/components/loader/Loader"
import { toast } from "react-toastify"
import DeleteButton from "@/components/multiAction/DeleteButton"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from "framer-motion"
import { User, ChevronUp, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetUserQuery } from "@/redux/api/apiSlice"

type Props = {
  currentAvatarUrl?: string
}

export default function UsersPage({ currentAvatarUrl }: Props) {
  const { data: userx } = useGetUserQuery({});
  const { data, isLoading, refetch } = useGetAllUsersQuery({})
  const [deleteUser, { error, isSuccess, isLoading: loading }] = useDeleteUserMutation({})
  const [id, setId] = useState("")
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [sortOrder, setSortOrder] = useState("asc")
  const [roleFilter, setRoleFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const itemsPerPage = 10

  const handleDelete = async () => {
    await deleteUser(id)
  }

  useEffect(() => {
    if (isSuccess) {
      refetch()
      toast.success("User deleted successfully")
      setOpen(false)
    }

    if (error) {
      if ("data" in error) {
        const errorMessage = error as any
        toast.error(errorMessage.data.message)
      }
    }
  }, [isSuccess, error, refetch])

  useEffect(() => {
    if (data?.users) {
      const filtered = data?.users?.filter((user: any) => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
          user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
          user?.role?.toLowerCase()?.includes(searchTerm?.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role?.toLowerCase() === roleFilter?.toLowerCase();
        const matchesVerification = verificationFilter === "all" ||
          (verificationFilter === "verified" && user.isVerified) ||
          (verificationFilter === "unverified" && !user.isVerified);
        return matchesSearch && matchesRole && matchesVerification;
      });
      const sorted: any = [...filtered].sort((a: any, b: any) => {
        if (sortOrder === "asc") {
          return a.role?.localeCompare(b.role);
        } else {
          return b.role?.localeCompare(a.role);
        }
      });
      setFilteredUsers(sorted);
      setCurrentPage(1);
    }
  }, [data, searchTerm, sortOrder, roleFilter, verificationFilter]);


  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)


  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4,
        ease: "easeOut"
      }
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
    <>
      {data?.users.length > 0 ?
        <Card>
          <CardHeader>
          </CardHeader>
          {isLoading ? <Loader /> :
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full mb-4">
                <div className="flex flex-1 flex-row space-x-3 w-full sm:w-auto">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full flex flex-1 sm:w-64"
                  />
                  <Button className='bg-[#5025d1] hover:bg-blue-900' onClick={() => setSearchTerm("")}>Clear</Button>
                </div>

                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={verificationFilter} onValueChange={(value) => setVerificationFilter(value)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead onClick={toggleSortOrder} className="cursor-pointer">
                      Role {sortOrder === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user: any) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={currentAvatarUrl || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                          <AvatarFallback>
                            {user?.avatar?.url ? <img src={user?.avatar?.url} /> :
                              <User className="h-20 lg:h-20 w-20 lg:w-20" />
                            }
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell className=" capitalize">{user.role}</TableCell>
                      {userx && user?.user?.role == "admin" &&
                        <>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => { setId(user?._id), setOpen(true) }}>Delete</Button>
                          </TableCell>
                        </>
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <div>
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          }
        </Card>
        :
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6 space-y-6">
              <motion.div
                className="flex justify-center"
                initial="hidden"
                animate="visible"
                variants={iconVariants}
              >
                <div className="relative">
                  <User size={70} className="text-primary text-blue-400" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary/20 absolute top-0 left-0"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <motion.div
                className="text-center space-y-4"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <h1 className="text-xl md:text-3xl font-semibold tracking-tight">No User Available</h1>
                <p className="text-muted-foreground">
                  It seems we don't have any users yet. Stay tuned to see our growing community!
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      }
      {open && (
        <DeleteButton setOpen={setOpen} open={open} action="Delete" text="Are you sure you want to delete user?" handleDelete={handleDelete} loadingDelete={loading} />
      )}
    </>
  )
}