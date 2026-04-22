import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react"
import { Textarea } from "../ui/textarea"
import { toast } from "react-toastify"
import { useUpdateUserRoleMutation } from "@/redux/features/user/userApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


type Props = {
    setIsUserOpen: any
    refetch: any;
    datax: any
    initialStatus: {
        isSuspend: boolean
    }
}

export default function UserMultiActionModal({ datax, setIsUserOpen, initialStatus, refetch, }: Props) {
    const [isSuspend, setIsSuspend] = useState(initialStatus?.isSuspend || datax?.isSuspend)
    const [role, setRole] = useState(datax?.role)
    const [reason, setReason] = useState(datax?.reason)
    const [updateUserRole, { isSuccess, isLoading, error }] = useUpdateUserRoleMutation()
    const id = datax?._id

    const handleStatusUpdate = async () => {
        await updateUserRole({ role, id, isSuspend, reason }).unwrap()
    }

    useEffect(() => {
        if (isSuccess) {
            refetch()
            toast.success("User updated successfully")
            setIsUserOpen(false)
        }
        if (error) {
            if ("data" in error) {
                const errorMessage = error as any
                toast.error(errorMessage.data.message)
            }
        }

    }, [isSuccess, error, refetch])


    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 z-50"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 md:p-5 lg:p-8  rounded shadow-lg z-50 w-[90%] md:w-[40%] lg:w-[30%] overflow-y-auto">
                <div className="flex justify-between flex-col items-center mb-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="suspend-toggle">Suspend Listing</Label>
                                    <Switch
                                        id="suspend-toggle"
                                        checked={isSuspend}
                                        onCheckedChange={setIsSuspend}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {isSuspend ? 'Suspended' : 'Active'}
                                </span>
                            </div>

                            {isSuspend && (
                                <div className="space-y-2">
                                    <Label htmlFor="suspend-reason">Suspension Reason</Label>
                                    <Textarea
                                        id="suspend-reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Enter reason for suspension"
                                    />
                                </div>
                            )}

                            <div>
                                <h1>Gender</h1>
                                <Select
                                    value={role}
                                    onValueChange={setRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Set role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guest">Guest</SelectItem>
                                        <SelectItem value="host">Host</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleStatusUpdate} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : (

                                    "Update"

                                )}
                            </Button>
                        </CardContent>
                    </Card>
                    <Button className="mt-3" variant="ghost" onClick={() => setIsUserOpen(false)}>Close</Button>
                </div>
            </div>
        </>
    )
}

