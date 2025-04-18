# Modal Component

A reusable modal dialog component for the Claims Hive project.

## Features

- Customizable size and position
- Support for forms and content
- Animation options
- Accessibility features
- Draggable and resizable options
- Static methods for common use cases (alert, confirm, prompt)
- Backdrop customization
- Custom buttons and callbacks

## Usage

### Basic Usage

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="path/to/modal.css">

<!-- Import and initialize the modal -->
<script type="module">
    import Modal from './path/to/Modal.js';
    
    // Create a new modal
    const modal = new Modal({
        title: 'My Modal',
        content: 'This is a basic modal dialog.'
    });
    
    // Open the modal
    modal.open();
</script>
```

### Configuration Options

The Modal component accepts the following options:

```javascript
{
    // The ID for the modal (optional, will be auto-generated if not provided)
    id: 'my-modal',
    
    // The title for the modal
    title: 'Modal Title',
    
    // The content for the modal (HTML string or DOM element)
    content: 'Modal content goes here',
    
    // Whether the modal can be closed by the user (default: true)
    closable: true,
    
    // Whether to show a backdrop behind the modal (default: true)
    backdrop: true,
    
    // Whether clicking the backdrop closes the modal (default: true)
    backdropClosable: true,
    
    // Whether pressing the ESC key closes the modal (default: true)
    escClosable: true,
    
    // The size of the modal: 'small', 'medium', 'large', 'fullscreen' (default: 'medium')
    size: 'medium',
    
    // The position of the modal: 'center', 'top', 'right', 'bottom', 'left' (default: 'center')
    position: 'center',
    
    // Whether to animate the modal (default: true)
    animate: true,
    
    // The type of animation: 'fade', 'slide', 'zoom' (default: 'fade')
    animationType: 'fade',
    
    // Callback function when the modal is opened
    onOpen: function() {
        console.log('Modal opened');
    },
    
    // Callback function when the modal is closed
    onClose: function() {
        console.log('Modal closed');
    },
    
    // Callback function when the confirm button is clicked
    onConfirm: function() {
        console.log('Confirmed');
    },
    
    // Callback function when the cancel button is clicked
    onCancel: function() {
        console.log('Cancelled');
    },
    
    // Whether to show the footer with buttons (default: true)
    showFooter: true,
    
    // The text for the confirm button (default: 'Confirm')
    confirmText: 'Confirm',
    
    // The text for the cancel button (default: 'Cancel')
    cancelText: 'Cancel',
    
    // Whether to show the confirm button (default: true)
    showConfirmButton: true,
    
    // Whether to show the cancel button (default: true)
    showCancelButton: true,
    
    // Additional CSS class for the confirm button
    confirmButtonClass: 'btn-primary',
    
    // Additional CSS class for the cancel button
    cancelButtonClass: 'btn-secondary',
    
    // Whether the modal can be dragged (default: false)
    draggable: false,
    
    // Whether the modal can be resized (default: false)
    resizable: false
}
```

### Methods

The Modal component provides the following methods:

#### open()

Opens the modal.

```javascript
modal.open();
```

#### close()

Closes the modal.

```javascript
modal.close();
```

#### setTitle(title)

Updates the modal title.

```javascript
modal.setTitle('New Title');
```

#### setContent(content)

Updates the modal content.

```javascript
modal.setContent('New content');
// or
const element = document.createElement('div');
element.innerHTML = '<p>New content</p>';
modal.setContent(element);
```

#### setConfirmText(text)

Updates the confirm button text.

```javascript
modal.setConfirmText('Save');
```

#### setCancelText(text)

Updates the cancel button text.

```javascript
modal.setCancelText('Discard');
```

#### setSize(size)

Updates the modal size.

```javascript
modal.setSize('large'); // 'small', 'medium', 'large', 'fullscreen'
```

#### setPosition(position)

Updates the modal position.

```javascript
modal.setPosition('top'); // 'center', 'top', 'right', 'bottom', 'left'
```

#### destroy()

Destroys the modal and removes it from the DOM.

```javascript
modal.destroy();
```

### Static Methods

The Modal component provides the following static methods for common use cases:

#### Modal.alert(message, title, callback)

Creates and opens an alert modal.

```javascript
Modal.alert('This is an alert message!', 'Alert', () => {
    console.log('Alert closed');
});
```

#### Modal.confirm(message, title, onConfirm, onCancel)

Creates and opens a confirm modal.

```javascript
Modal.confirm(
    'Are you sure you want to proceed?', 
    'Confirm Action',
    () => console.log('Confirmed!'),
    () => console.log('Cancelled!')
);
```

#### Modal.prompt(message, defaultValue, title, onConfirm, onCancel)

Creates and opens a prompt modal.

```javascript
Modal.prompt(
    'Please enter your name:',
    '',
    'User Input',
    (value) => console.log('Input value:', value),
    () => console.log('Prompt cancelled')
);
```

## Examples

### Basic Modal

```javascript
const basicModal = new Modal({
    title: 'Basic Modal',
    content: 'This is a basic modal with default options.'
});
basicModal.open();
```

### Form Modal

```javascript
const formContent = document.createElement('div');
formContent.innerHTML = `
    <form id="demo-form">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
        </div>
        <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" rows="3" required></textarea>
        </div>
    </form>
`;

const modal = new Modal({
    title: 'Form Modal',
    content: formContent,
    confirmText: 'Submit',
    cancelText: 'Cancel',
    onConfirm: () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (name && email && message) {
            console.log('Form submitted:', { name, email, message });
            return true;
        } else {
            alert('Please fill out all fields');
            return false;
        }
    }
});
modal.open();
```

### Draggable and Resizable Modal

```javascript
const modal = new Modal({
    title: 'Draggable and Resizable Modal',
    content: 'This modal can be dragged and resized.',
    draggable: true,
    resizable: true
});
modal.open();
```

### Custom Buttons

```javascript
const modal = new Modal({
    title: 'Custom Buttons',
    content: 'This modal has custom buttons in the footer.',
    confirmText: 'Save Changes',
    cancelText: 'Discard',
    confirmButtonClass: 'btn-success',
    cancelButtonClass: 'btn-danger',
    onConfirm: () => console.log('Changes saved!'),
    onCancel: () => console.log('Changes discarded!')
});
modal.open();
```

## Browser Support

The Modal component works in all modern browsers that support ES6 modules:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

The Modal component follows accessibility best practices:

- Uses appropriate ARIA attributes
- Traps focus within the modal
- Supports keyboard navigation
- Provides proper labeling

## License

This component is part of the Claims Hive project and is covered by its license.
