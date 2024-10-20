'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, Folder, File, Upload, Search, Edit2, ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

type FileType = {
  id: string
  name: string
  type: string
  size: number
  lastModified: Date
  url?: string
}

type FolderType = {
  id: string
  name: string
  children: (FolderType | FileType)[]
}

const initialFolders: FolderType = {
  id: 'root',
  name: 'Home',
  children: [
    { id: 'docs', name: 'Documents', children: [
      { id: 'resume', name: 'Resume.pdf', type: 'pdf', size: 1024000, lastModified: new Date('2023-01-15') },
      { id: 'report', name: 'Report.docx', type: 'docx', size: 2048000, lastModified: new Date('2023-03-20') }
    ]},
    { id: 'images', name: 'Images', children: [
      { id: 'vacation', name: 'Vacation.jpg', type: 'jpg', size: 3072000, lastModified: new Date('2023-05-10'), url: 'https://picsum.photos/200/300' },
      { id: 'profile', name: 'Profile.png', type: 'png', size: 1536000, lastModified: new Date('2023-06-05'), url: 'https://picsum.photos/200/300' }
    ]},
    { id: 'videos', name: 'Videos', children: [
      { id: 'tutorial', name: 'Tutorial.mp4', type: 'mp4', size: 10240000, lastModified: new Date('2023-04-01') }
    ]},
    { id: 'music', name: 'Music', children: [
      { id: 'song', name: 'Song.mp3', type: 'mp3', size: 5120000, lastModified: new Date('2023-02-14') }
    ]},
  ]
}

export function AssetManagerComponent() {
  const [folders, setFolders] = useState<FolderType>(initialFolders)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'lastModified'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [visibleFiles, setVisibleFiles] = useState(8)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (folder: FolderType, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    return (
      <div key={folder.id} style={{ marginLeft: `${depth * 20}px` }}>
        <Button
          variant="ghost"
          className="w-full justify-start py-1"
          onClick={() => toggleFolder(folder.id)}
        >
          {isExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
          <Folder className="mr-2 h-4 w-4" />
          {folder.name}
        </Button>
        {isExpanded && folder.children.map(child => 
          'type' in child
            ? <Button
                key={child.id}
                variant="ghost"
                className="w-full justify-start py-1 pl-10"
                onClick={() => setSelectedFile(child)}
              >
                <File className="mr-2 h-4 w-4" />
                {child.name}
              </Button>
            : renderFolder(child, depth + 1)
        )}
      </div>
    )
  }

  const handleRename = () => {
    if (selectedFile && newFileName) {
      // Validate new file name
      if (!/^[\w\-. ]+$/.test(newFileName)) {
        toast({
          title: "Invalid file name",
          description: "File name can only contain letters, numbers, spaces, hyphens, underscores, and periods.",
          variant: "destructive",
        })
        return
      }

      // Check for duplicate names
      const isDuplicate = folders.children.some(child => 
        'type' in child && child.name.toLowerCase() === newFileName.toLowerCase() && child.id !== selectedFile.id
      )
      if (isDuplicate) {
        toast({
          title: "Duplicate file name",
          description: "A file with this name already exists.",
          variant: "destructive",
        })
        return
      }

      // Perform rename operation
      setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders))
        const renameInFolder = (folder: FolderType): FolderType => ({
          ...folder,
          children: folder.children.map(child => 
            'type' in child && child.id === selectedFile.id
              ? { ...child, name: newFileName }
              : 'type' in child ? child : renameInFolder(child)
          )
        })
        return renameInFolder(newFolders)
      })
      setSelectedFile({ ...selectedFile, name: newFileName })
      setIsRenameModalOpen(false)
      setNewFileName('')
      toast({
        title: "File renamed",
        description: `Successfully renamed to ${newFileName}`,
      })
    }
  }

  const handleDelete = () => {
    if (selectedFile) {
      setFolders(prevFolders => {
        const newFolders = JSON.parse(JSON.stringify(prevFolders))
        const deleteInFolder = (folder: FolderType): FolderType => ({
          ...folder,
          children: folder.children.filter(child => 
            'type' in child ? child.id !== selectedFile.id : true
          ).map(child => 'type' in child ? child : deleteInFolder(child))
        })
        return deleteInFolder(newFolders)
      })
      setSelectedFile(null)
      setIsDeleteDialogOpen(false)
      toast({
        title: "File deleted",
        description: `Successfully deleted ${selectedFile.name}`,
      })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceId = result.source.droppableId
    const destId = result.destination.droppableId

    setFolders(prevFolders => {
      const newFolders = JSON.parse(JSON.stringify(prevFolders))
      
      const findAndRemove = (folderId: string, fileId: string): FileType | null => {
        const folder = folderId === 'root' ? newFolders : newFolders.children.find((f: FolderType) => f.id === folderId)
        if (folder) {
          const fileIndex = folder.children.findIndex((f: FileType | FolderType) => 'id' in f && f.id === fileId)
          if (fileIndex > -1) {
            return folder.children.splice(fileIndex, 1)[0] as FileType
          }
        }
        return null
      }

      const file = findAndRemove(sourceId, result.draggableId)
      if (file) {
        const destFolder = destId === 'root' ? newFolders : newFolders.children.find((f: FolderType) => f.id === destId)
        if (destFolder) {
          destFolder.children.splice(result.destination.index, 0, file)
        }
      }

      return newFolders
    })
  }

  const sortedFiles = useMemo(() => {
    const allFiles = folders.children.flatMap(child => 
      'type' in child ? [child] : child.children.filter((grandChild): grandChild is FileType => 'type' in grandChild)
    )
    return allFiles.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1
      }
    })
  }, [folders, sortBy, sortOrder])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newFile: FileType = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified),
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }
      setFolders(prevFolders => ({
        ...prevFolders,
        children: [...prevFolders.children, newFile]
      }))
      toast({
        title: "File uploaded",
        description: `Successfully uploaded ${file.name}`,
      })
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-background">
        {/* Folder Tree Section */}
        <Droppable droppableId="root" type="FOLDER">
          {(provided) => (
            <aside className="w-1/4 border-r p-4" ref={provided.innerRef} {...provided.droppableProps}>
              <h2 className="text-lg font-semibold mb-4">Folders</h2>
              <ScrollArea className="h-[calc(100vh-6rem)]">
                {renderFolder(folders)}
              </ScrollArea>
              {provided.placeholder}
            </aside>
          )}
        </Droppable>

        {/* File Display Section */}
        <main className="flex-1 flex flex-col">
          {/* Fixed Container for File Actions */}
          <div className="p-4 border-b">
            <div className="flex space-x-4 mb-4">
              <Button asChild>
                <label>
                  <Upload className="mr-2 h-4 w-4" /> Upload File
                  <input type="file" hidden onChange={handleFileUpload} />
                </label>
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search files..." className="pl-8" />
              </div>
              <Button 
                disabled={!selectedFile}
                onClick={() => {
                  setNewFileName(selectedFile?.name || '')
                  setIsRenameModalOpen(true)
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" /> Rename
              </Button>
              <Button 
                disabled={!selectedFile}
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={(value: 'name' | 'type' | 'size' | 'lastModified') => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="lastModified">Last Modified</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>

          {/* File List */}
          <ScrollArea className="flex-1 p-4">
            <Droppable droppableId="files" type="FILE">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedFiles.slice(0, visibleFiles).map((file, index) => (
                    <Draggable key={file.id} draggableId={file.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Button
                            variant="outline"
                            className="h-32 w-full flex flex-col items-center justify-center text-center p-2"
                            onClick={() => {
                              setSelectedFile(file)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            {file.type.startsWith('image/') && file.url ? (
                              <img  src={file.url} alt={file.name} className="h-16 w-16 object-cover mb-2" />
                            ) : (
                              <File className="h-16 w-16 mb-2" />
                            )}
                            {file.name}
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {visibleFiles < sortedFiles.length && (
              <Button 
                className="mt-4 w-full" 
                onClick={() => setVisibleFiles(prev => Math.min(prev + 8, sortedFiles.length))}
              >
                Load More
              </Button>
            )}
          </ScrollArea>
        </main>

        {/* Rename Modal */}
        <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRename}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File Details</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="py-4">
                {selectedFile.type.startsWith('image/') && selectedFile.url && (
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-48 object-cover mb-4" />
                )}
                <p><strong>Name:</strong> {selectedFile.name}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Last Modified:</strong> {selectedFile.lastModified.toLocaleDateString()}</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DragDropContext>
  )
}