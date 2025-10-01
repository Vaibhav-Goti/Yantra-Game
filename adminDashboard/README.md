# Gaming Admin Dashboard Components

A comprehensive set of reusable, responsive UI components for your gaming admin panel built with React and Tailwind CSS.

## 🎯 Features

- **Fully Responsive**: All components work on mobile, tablet, and desktop
- **Customizable**: Easy to modify styles and behavior
- **Accessible**: Built with accessibility in mind
- **TypeScript Ready**: Easy to add TypeScript support
- **Tailwind CSS**: Modern utility-first CSS framework

## 📦 Components

### UI Components

#### Card
```jsx
import { Card, CardHeader, CardBody, CardFooter } from './components/ui';

<Card>
  <CardHeader>Header Content</CardHeader>
  <CardBody>Body Content</CardBody>
  <CardFooter>Footer Content</CardFooter>
</Card>
```

#### Button
```jsx
import { Button } from './components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

#### Input
```jsx
import { Input, Textarea } from './components/ui';

<Input 
  label="Name" 
  placeholder="Enter name" 
  error={errors.name}
  required 
/>
```

#### Table
```jsx
import { Table, TableHeader, TableBody, TableRow, TableColumn } from './components/ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableColumn>Name</TableColumn>
      <TableColumn>Status</TableColumn>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableColumn>Machine 1</TableColumn>
      <TableColumn>Active</TableColumn>
    </TableRow>
  </TableBody>
</Table>
```

#### Modal
```jsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from './components/ui';

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>Modal Title</ModalHeader>
  <ModalBody>Modal Content</ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>
```

#### Dropdown
```jsx
import { Dropdown, DropdownItem } from './components/ui';

<Dropdown trigger={<Button>Actions</Button>}>
  <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
  <DropdownItem onClick={handleDelete}>Delete</DropdownItem>
</Dropdown>
```

#### Search
```jsx
import { Search } from './components/ui';

<Search 
  placeholder="Search machines..." 
  onSearch={handleSearch}
  debounceMs={300}
/>
```

#### Filter
```jsx
import { Filter, FilterChips } from './components/ui';

<Filter 
  options={statusOptions}
  value={selectedStatus}
  onChange={setSelectedStatus}
  placeholder="Filter by status"
/>
```

#### Status Badge
```jsx
import { StatusBadge, MachineStatusBadge } from './components/ui';

<MachineStatusBadge status="Active" />
<StatusBadge status="Completed" variant="success" />
```

#### Loading
```jsx
import { Loading, LoadingOverlay, LoadingPage } from './components/ui';

<Loading size="lg" text="Loading..." />
<LoadingOverlay isLoading={loading}>
  <div>Content</div>
</LoadingOverlay>
```

### Layout Components

#### Layout
```jsx
import { Layout } from './components/layout';

<Layout title="Dashboard">
  <div>Your page content</div>
</Layout>
```

#### Sidebar
```jsx
import { Sidebar } from './components/layout';

<Sidebar isOpen={sidebarOpen} />
```

#### Header
```jsx
import { Header } from './components/layout';

<Header title="Dashboard" onMenuToggle={toggleMenu} />
```

## 🎨 Customization

### Button Variants
- `primary` - Blue button
- `secondary` - Gray button
- `success` - Green button
- `danger` - Red button
- `warning` - Yellow button
- `info` - Cyan button
- `outline` - Outlined button
- `ghost` - Transparent button
- `link` - Link style button

### Button Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### Input Variants
- `default` - Standard input
- `error` - Error state
- `success` - Success state

### Status Badge Variants
- `default` - Gray
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `info` - Blue
- `primary` - Blue

## 🚀 Usage Examples

### Machine Management Page
```jsx
import { Layout, Card, Table, Button, StatusBadge, Search, Filter } from './components';

const MachinesPage = () => {
  return (
    <Layout title="Machines">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex space-x-4">
            <Search placeholder="Search machines..." />
            <Filter options={statusOptions} placeholder="Filter by status" />
          </div>
        </Card>
        
        {/* Machines Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableColumn>Name</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Deposit</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machines.map(machine => (
                <TableRow key={machine.id}>
                  <TableColumn>{machine.name}</TableColumn>
                  <TableColumn>
                    <MachineStatusBadge status={machine.status} />
                  </TableColumn>
                  <TableColumn>₹{machine.deposit}</TableColumn>
                  <TableColumn>
                    <Button size="sm" variant="outline">Edit</Button>
                  </TableColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};
```

### Game Session Modal
```jsx
import { Modal, Card, Table, StatusBadge } from './components';

const GameSessionModal = ({ isOpen, onClose, session }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <h3 className="text-lg font-medium">Game Session Details</h3>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Session ID</label>
              <p className="text-sm text-gray-900">{session.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <GameStatusBadge status={session.status} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Winners</label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableColumn>Button</TableColumn>
                  <TableColumn>Amount</TableColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.winners.map(winner => (
                  <TableRow key={winner.buttonNumber}>
                    <TableColumn>Button {winner.buttonNumber}</TableColumn>
                    <TableColumn>₹{winner.amount}</TableColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};
```

## 📱 Responsive Design

All components are fully responsive and work on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## 🎯 Admin Panel Pages

Use these components to build:

1. **Dashboard** - Overview cards, charts, recent activity
2. **Machines** - Machine list, create/edit forms, deposit management
3. **Timeframes** - Timeframe management per machine
4. **Game Sessions** - Session history, details, statistics
5. **Statistics** - Analytics, reports, charts
6. **Users** - User management, roles, permissions

## 🔧 Installation

1. Install dependencies:
```bash
npm install react react-dom react-router-dom
npm install -D tailwindcss @tailwindcss/forms
```

2. Import components:
```jsx
import { Card, Button, Table } from './components';
```

3. Use in your admin panel!

## 🎨 Styling

All components use Tailwind CSS classes and can be customized by:
- Passing `className` props
- Modifying the component source
- Using CSS custom properties
- Extending Tailwind config

Happy coding! 🚀