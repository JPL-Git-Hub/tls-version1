"use client"

import { useState } from "react"
import { 
  Cloud, 
  Download, 
  FileText, 
  Folder, 
  Grid3X3, 
  Home,
  Image,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Share,
  Star,
  Trash2,
  Upload,
  Users,
  Video,
  X,
  Eye,
  Edit,
  FolderPlus,
  Filter,
  SortAsc,
  Calendar,
  Clock,
  HardDrive,
  Scale
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  modified: string
  shared: boolean
  starred: boolean
  fileType?: "pdf" | "image" | "video" | "document" | "other"
  thumbnail?: string
  caseId?: string
  caseName?: string
}

const mockCases = [
  { id: "case-001", name: "Manhattan Condo Purchase - 123 West 57th St" },
  { id: "case-002", name: "Brooklyn Heights Coop Sale - 85 Pierrepont St" },
  { id: "case-003", name: "Upper East Side Condo Closing - 740 Park Ave" },
  { id: "case-004", name: "Chelsea Coop Purchase - 200 11th Ave" },
  { id: "case-005", name: "Financial District Condo Sale - 75 Wall St" }
]

const mockFiles: FileItem[] = [
  { id: "1", name: "Legal Documents", type: "folder", modified: "2 days ago", shared: true, starred: false, caseId: "case-001", caseName: "Manhattan Condo Purchase - 123 West 57th St" },
  { id: "2", name: "Purchase Agreement", type: "folder", modified: "1 week ago", shared: false, starred: true, caseId: "case-001", caseName: "Manhattan Condo Purchase - 123 West 57th St" },
  { id: "3", name: "Coop_Board_Package.pdf", type: "file", size: "2.4 MB", modified: "3 hours ago", shared: true, starred: false, fileType: "pdf", caseId: "case-002", caseName: "Brooklyn Heights Coop Sale - 85 Pierrepont St" },
  { id: "4", name: "Property_Photos.jpg", type: "file", size: "1.8 MB", modified: "1 day ago", shared: false, starred: true, fileType: "image", caseId: "case-001", caseName: "Manhattan Condo Purchase - 123 West 57th St" },
  { id: "5", name: "Property_Walkthrough.mp4", type: "file", size: "45.2 MB", modified: "4 days ago", shared: true, starred: false, fileType: "video", caseId: "case-005", caseName: "Financial District Condo Sale - 75 Wall St" },
  { id: "6", name: "Closing_Checklist.docx", type: "file", size: "892 KB", modified: "2 days ago", shared: false, starred: false, fileType: "document", caseId: "case-003", caseName: "Upper East Side Condo Closing - 740 Park Ave" },
  { id: "7", name: "Financial_Records", type: "folder", modified: "1 week ago", shared: true, starred: false, caseId: "case-004", caseName: "Chelsea Coop Purchase - 200 11th Ave" },
  { id: "8", name: "Attorney_Notes.txt", type: "file", size: "12 KB", modified: "5 hours ago", shared: false, starred: true, fileType: "other", caseId: "case-002", caseName: "Brooklyn Heights Coop Sale - 85 Pierrepont St" },
  { id: "9", name: "Title_Search.pdf", type: "file", size: "3.1 MB", modified: "1 week ago", shared: false, starred: false, fileType: "pdf", caseId: "case-001", caseName: "Manhattan Condo Purchase - 123 West 57th St" },
  { id: "10", name: "HOA_Bylaws.docx", type: "file", size: "456 KB", modified: "3 days ago", shared: true, starred: true, fileType: "document", caseId: "case-003", caseName: "Upper East Side Condo Closing - 740 Park Ave" }
]

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Client Portal", href: "/portal" },
  { name: "Documents", href: "/documents" }
]

export default function DocumentManagementPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCase, setFilterCase] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const getFileIcon = (item: FileItem) => {
    if (item.type === "folder") return <Folder className="h-4 w-4" />
    switch (item.fileType) {
      case "pdf": return <FileText className="h-4 w-4 text-red-500" />
      case "image": return <Image className="h-4 w-4 text-blue-500" />
      case "video": return <Video className="h-4 w-4 text-purple-500" />
      case "document": return <FileText className="h-4 w-4 text-blue-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || 
      (filterType === "folders" && file.type === "folder") ||
      (filterType === "files" && file.type === "file") ||
      (filterType === "shared" && file.shared) ||
      (filterType === "starred" && file.starred)
    const matchesCase = filterCase === "all" || file.caseId === filterCase
    return matchesSearch && matchesFilter && matchesCase
  })

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id))
    }
  }

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
                <p className="text-gray-600">Organize, share, and collaborate on your legal documents</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  2.4 GB used of 10 GB
                </Badge>
                <Button onClick={simulateUpload} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <BreadcrumbItem>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading files...</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-xs text-gray-500">Uploading Contract_Amendment.pdf</p>
              </CardContent>
            </Card>
          )}

          {/* Toolbar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                {/* Search and Filters */}
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search files and folders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="folders">Folders</SelectItem>
                      <SelectItem value="files">Files</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="starred">Starred</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCase} onValueChange={setFilterCase}>
                    <SelectTrigger className="w-48">
                      <Scale className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by case" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cases</SelectItem>
                      {mockCases.map((case_) => (
                        <SelectItem key={case_.id} value={case_.id}>
                          {case_.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="modified">Modified</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions and View Toggle */}
                <div className="flex items-center gap-2">
                  {selectedFiles.length > 0 && (
                    <div className="flex items-center gap-2 mr-4">
                      <span className="text-sm text-gray-600">
                        {selectedFiles.length} selected
                      </span>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FolderPlus className="h-4 w-4 mr-1" />
                        New Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                          Enter a name for the new folder.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input id="folder-name" placeholder="Enter folder name..." />
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Folder</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Content */}
          {viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <ContextMenu key={file.id}>
                  <ContextMenuTrigger>
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded-lg">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Checkbox
                              checked={selectedFiles.includes(file.id)}
                              onCheckedChange={() => handleSelectFile(file.id)}
                            />
                            {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            {file.shared && <Users className="h-4 w-4 text-blue-500" />}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          {file.caseName && (
                            <p className="text-xs text-blue-600 truncate" title={file.caseName}>
                              {file.caseName}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{file.type === "file" ? file.size : "Folder"}</span>
                            <span>{file.modified}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            /* List View */
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Case</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Shared</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <ContextMenu key={file.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className={`cursor-pointer ${selectedFiles.includes(file.id) ? 'bg-blue-50' : ''}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedFiles.includes(file.id)}
                              onCheckedChange={() => handleSelectFile(file.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getFileIcon(file)}
                              <span className="font-medium">{file.name}</span>
                              {file.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            {file.caseName ? (
                              <div className="max-w-48">
                                <p className="text-sm font-medium truncate" title={file.caseName}>
                                  {file.caseName}
                                </p>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {file.type === "folder" ? "Folder" : file.fileType || "File"}
                            </Badge>
                          </TableCell>
                          <TableCell>{file.size || "-"}</TableCell>
                          <TableCell>{file.modified}</TableCell>
                          <TableCell>
                            {file.shared ? (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <Users className="h-3 w-3" />
                                Shared
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Sharing Dialog */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="hidden">Share</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Share Files</SheetTitle>
                <SheetDescription>
                  Manage access and permissions for selected files.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div>
                  <Label htmlFor="share-email">Share with</Label>
                  <Input id="share-email" placeholder="Enter email address..." />
                </div>
                
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="can-view" className="text-sm">Can view</Label>
                      <Switch id="can-view" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="can-comment" className="text-sm">Can comment</Label>
                      <Switch id="can-comment" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="can-edit" className="text-sm">Can edit</Label>
                      <Switch id="can-edit" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="can-download" className="text-sm">Can download</Label>
                      <Switch id="can-download" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Link sharing</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value="https://portal.thelawshop.com/shared/abc123" readOnly />
                      <Button variant="outline" size="sm">Copy</Button>
                    </div>
                    <p className="text-xs text-gray-500">Anyone with this link can view the files</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </TooltipProvider>
  )
}