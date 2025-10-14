'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'

export default function ComponentsTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            shadcn/ui Components Test
          </h1>
          <p className="text-muted-foreground">
            Testing all installed components with Tailwind CSS v3
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Different button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button className="relative before:content-['★'] before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2 before:text-yellow-400">Default</Button>
              <Button variant="secondary" className="relative after:content-['→'] after:absolute after:-right-6 after:top-1/2 after:-translate-y-1/2 after:text-blue-500">Secondary</Button>
              <Button variant="destructive" className="relative before:content-['⚠'] before:absolute before:top-0 before:right-0 before:-translate-y-1/2 before:translate-x-1/2 before:text-xs">Destructive</Button>
              <Button variant="outline" className="relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400/20 before:to-pink-400/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500">Outline</Button>
              <Button variant="ghost" className="relative after:content-[''] after:absolute after:inset-0 after:border after:border-current after:rounded after:scale-0 hover:after:scale-105 after:transition-transform after:duration-200 after:opacity-30">Ghost</Button>
              <Button variant="link" className="relative before:content-['🔗'] before:absolute before:-left-5 before:top-1/2 before:-translate-y-1/2 before:text-sm before:opacity-60">Link</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-current hover:after:w-full after:transition-all after:duration-300">Small</Button>
              <Button size="default" className="relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-0.5 before:bg-gradient-to-r before:from-green-400 before:to-blue-500">Default</Button>
              <Button size="lg" className="relative after:content-['✨'] after:absolute after:top-1 after:right-1 after:text-xs after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
            <CardDescription>Inputs, labels, and selects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="select">Select Option</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Info Alert</AlertTitle>
            <AlertDescription>
              This is a default alert with an icon and description.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Alert</AlertTitle>
            <AlertDescription>
              This is a destructive alert showing an error state.
            </AlertDescription>
          </Alert>
        </div>

        {/* Interactive Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Dialogs and dropdown menus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Example</DialogTitle>
                    <DialogDescription>
                      This is a modal dialog built with shadcn/ui components.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dialog-input">Name</Label>
                      <Input id="dialog-input" placeholder="Enter your name" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Save</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Dropdown Menu <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Color System Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color System Test</CardTitle>
            <CardDescription>Testing HSL CSS variables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded bg-primary text-primary-foreground text-center">
                Primary
              </div>
              <div className="p-4 rounded bg-secondary text-secondary-foreground text-center">
                Secondary
              </div>
              <div className="p-4 rounded bg-muted text-muted-foreground text-center">
                Muted
              </div>
              <div className="p-4 rounded bg-accent text-accent-foreground text-center">
                Accent
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pseudo Elements Test */}
        <Card>
          <CardHeader>
            <CardTitle>Pseudo Elements Test</CardTitle>
            <CardDescription>Testing ::before and ::after pseudo-elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buttons with Pseudo Elements</h3>
              <div className="flex flex-wrap gap-4">
                <Button className="relative before:content-['✨'] before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2">
                  Before Icon
                </Button>
                <Button className="relative after:content-['→'] after:absolute after:-right-6 after:top-1/2 after:-translate-y-1/2">
                  After Arrow
                </Button>
                <Button className="relative before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:to-purple-600 before:rounded before:opacity-0 hover:before:opacity-20 before:transition-opacity before:-z-10">
                  Hover Overlay
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cards with Decorative Elements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-purple-500 before:rounded-t">
                  <CardHeader>
                    <CardTitle>Top Border Card</CardTitle>
                    <CardDescription>Card with gradient top border using ::before</CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="relative after:content-['💎'] after:absolute after:top-4 after:right-4 after:text-2xl after:opacity-20">
                  <CardHeader>
                    <CardTitle>Corner Decoration</CardTitle>
                    <CardDescription>Card with emoji decoration using ::after</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Text with Pseudo Elements</h3>
              <div className="space-y-2">
                <p className="relative text-lg before:content-['\201C'] before:text-4xl before:text-primary/30 before:absolute before:-left-4 before:-top-2 after:content-['\201D'] after:text-4xl after:text-primary/30 after:absolute after:-bottom-4 after:-right-4">
                  This text has decorative quotes using pseudo-elements
                </p>
                <p className="relative pl-6 before:content-['▶'] before:absolute before:left-0 before:text-primary">
                  Bullet point with custom marker
                </p>
                <p className="relative border-l-4 border-primary pl-4 before:content-[''] before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-3 before:bg-primary before:rounded-full">
                  Custom border indicator with dot
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Interactive Pseudo Elements</h3>
              <div className="flex flex-wrap gap-4">
                <Badge className="relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:skew-x-12">
                  Shine Effect
                </Badge>
                <Badge className="relative after:content-[''] after:absolute after:inset-0 after:border-2 after:border-current after:rounded after:scale-110 after:opacity-0 hover:after:scale-100 hover:after:opacity-100 after:transition-all after:duration-200">
                  Border Pulse
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}